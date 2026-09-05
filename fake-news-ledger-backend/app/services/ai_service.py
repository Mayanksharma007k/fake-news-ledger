import json
from app.config import settings
from app.services.evidence_service import search_evidence, local_evidence_analysis


async def analyze_claim(claim: str, article_text: str = "") -> dict:
    # Evidence is retrieved for every submitted claim. No static result is used.
    evidence = await search_evidence(claim)

    if not settings.openai_api_key:
        return local_evidence_analysis(claim, evidence)

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        evidence_text = "\n".join(
            f"- {e.get('source')}: {e.get('title')} | {e.get('url')}"
            for e in evidence
        ) or "No search results were retrieved."
        prompt = f'''
Analyze this submitted news claim using ONLY the claim, article text, and retrieved evidence below.
Do not invent sources, URLs, facts, or quotations. If evidence is insufficient, use UNCERTAIN.
Return JSON only with these keys:
status (SUPPORTED, UNCERTAIN, MISLEADING, or HIGH_RISK), trust_score (0-100),
ai_confidence (0-100), evidence_strength (0-100), source_reliability (0-100),
explanation (string), evidence (array).
Each evidence item should have type, source, reliability, text, and url when available.

CLAIM:
{claim}

ARTICLE:
{article_text[:12000]}

RETRIEVED CURRENT SEARCH EVIDENCE:
{evidence_text}
'''
        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are an evidence-oriented misinformation analysis assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        data = json.loads(response.choices[0].message.content)
        normalized = normalize(data, claim)
        if not normalized["evidence"]:
            normalized["evidence"] = evidence
        return normalized
    except Exception:
        # If the LLM is unavailable, still return a dynamic result for THIS claim.
        return local_evidence_analysis(claim, evidence)


def normalize(data: dict, claim: str) -> dict:
    return {
        "status": str(data.get("status", "UNCERTAIN")).upper(),
        "trust_score": max(0, min(100, int(data.get("trust_score", 50)))),
        "ai_confidence": max(0, min(100, int(data.get("ai_confidence", 60)))),
        "evidence_strength": max(0, min(100, int(data.get("evidence_strength", 40)))),
        "source_reliability": max(0, min(100, int(data.get("source_reliability", 40)))),
        "explanation": data.get("explanation", "The available information is insufficient for a strong conclusion."),
        "evidence": data.get("evidence", []),
    }
