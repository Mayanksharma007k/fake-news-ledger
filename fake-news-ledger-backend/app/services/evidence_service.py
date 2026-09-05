import re
from urllib.parse import quote_plus
import httpx
import xml.etree.ElementTree as ET

STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are",
    "was", "were", "has", "have", "had", "that", "this", "with", "by", "from",
    "will", "would", "could", "should", "about", "after", "before", "as", "at",
    "it", "its", "be", "been", "being", "than", "into", "over", "under"
}


def _terms(text: str) -> set[str]:
    words = re.findall(r"[A-Za-z0-9]{3,}", text.lower())
    return {w for w in words if w not in STOPWORDS}


async def search_evidence(claim: str, limit: int = 5) -> list[dict]:
    """Fetch current news-search signals from Google News RSS.

    This is evidence discovery, not proof by itself. The AI layer should weigh
    these sources before producing a verdict.
    """
    query = quote_plus(claim[:500])
    rss_url = (
        "https://news.google.com/rss/search?q=" + query +
        "&hl=en-IN&gl=IN&ceid=IN:en"
    )

    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=12,
            headers={"User-Agent": "FakeNewsLedger/1.0"},
        ) as client:
            response = await client.get(rss_url)
            response.raise_for_status()

        root = ET.fromstring(response.text)
        items = []
        for item in root.findall(".//item")[:limit]:
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            published = (item.findtext("pubDate") or "").strip()
            source_node = item.find("source")
            source = (source_node.text or "").strip() if source_node is not None else "News source"
            if title:
                items.append({
                    "type": "SEARCH_RESULT",
                    "source": source,
                    "title": title,
                    "text": f"Search result matching the submitted claim: {title}",
                    "url": link,
                    "published": published,
                    "reliability": 60,
                })
        return items
    except Exception:
        return []


def local_evidence_analysis(claim: str, evidence: list[dict]) -> dict:
    """Dynamic fallback when no LLM key is configured.

    It deliberately avoids claiming that a search result proves a claim. Scores
    vary with the submitted claim and the evidence actually found.
    """
    claim_terms = _terms(claim)
    matches = []
    for item in evidence:
        title_terms = _terms(item.get("title", ""))
        overlap = len(claim_terms & title_terms) / max(1, len(claim_terms))
        item = dict(item)
        item["match_score"] = round(overlap * 100)
        item["reliability"] = min(90, 45 + int(overlap * 45))
        matches.append(item)

    best = max((x.get("match_score", 0) for x in matches), default=0)
    count = len(matches)

    if count == 0:
        status = "UNCERTAIN"
        score = 40
        explanation = (
            "No current news-search evidence was retrieved for this claim. "
            "The system cannot responsibly mark it true or false without reliable evidence."
        )
    elif best >= 75:
        status = "SUPPORTED"
        score = min(90, 55 + best // 3)
        explanation = (
            f"Current search results contain strong textual matches for this claim. "
            f"{count} relevant result(s) were found. This is an evidence signal, not a guarantee of truth."
        )
    elif best >= 40:
        status = "UNCERTAIN"
        score = 45 + best // 4
        explanation = (
            f"Some current search results are related to the submitted claim, but the evidence is not strong enough "
            f"to establish it as true or false. {count} result(s) were found."
        )
    else:
        status = "HIGH_RISK"
        score = max(20, 45 - best // 2)
        explanation = (
            f"The retrieved results do not closely match the submitted claim. {count} result(s) were found, "
            "so the claim should be treated cautiously until stronger primary evidence is available."
        )

    return {
        "status": status,
        "trust_score": score,
        "ai_confidence": min(85, 45 + best // 2),
        "evidence_strength": min(90, best),
        "source_reliability": round(sum(x["reliability"] for x in matches) / len(matches)) if matches else 20,
        "explanation": explanation,
        "evidence": matches,
    }
