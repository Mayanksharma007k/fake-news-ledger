"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock3, ExternalLink, Link2, Users } from "lucide-react";
import { useParams } from "next/navigation";
import TrustScore from "@/components/TrustScore";
import StatusBadge from "@/components/StatusBadge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Evidence = {
  type: string;
  source: string;
  title?: string;
  reliability: number;
  text: string;
  url?: string;
  published?: string;
  match_score?: number;
};

type Verification = {
  id: string;
  claim: string;
  source_url?: string | null;
  status: string;
  trust_score: number;
  ai_confidence: number;
  evidence_strength: number;
  source_reliability: number;
  community_agreement: number;
  explanation: string;
  evidence: Evidence[];
  content_hash: string;
  blockchain_network: string;
  transaction_hash?: string | null;
  created_at: string;
};

export default function Results() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [v, setV] = useState<Verification | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/api/verify/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || "Verification not found");
        return data as Verification;
      })
      .then(setV)
      .catch((err) => setError(err.message || "Unable to load verification result."));
  }, [id]);

  if (error) return <main className="container py-10"><div className="card p-6 text-red-300">{error}</div></main>;
  if (!v) return <main className="container py-10"><div className="card p-6">Loading verification...</div></main>;

  const riskLabel = v.trust_score < 40 ? "High risk" : v.trust_score < 70 ? "Needs review" : "Lower risk";
  const date = new Date(v.created_at).toLocaleString();

  return (
    <main className="container py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Verification {v.id}</div>
          <h1 className="mt-2 text-3xl font-bold">Trust assessment</h1>
        </div>
        <StatusBadge status={v.status} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="card p-6 text-center">
          <TrustScore score={v.trust_score} />
          <div className="mt-4 font-bold">{riskLabel}</div>
          <p className="muted mt-2 text-xs">Evidence-based assessment, not a guarantee of truth or falsehood.</p>
        </div>

        <div className="space-y-5">
          <div className="card p-6">
            <div className="text-sm text-slate-400">Analyzed claim</div>
            <p className="mt-3 text-xl font-semibold leading-8">{v.claim}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["Evidence strength", `${v.evidence_strength}%`],
                ["Source reliability", `${v.source_reliability}%`],
                ["AI confidence", `${v.ai_confidence}%`],
                ["Community agreement", `${v.community_agreement}%`],
              ].map(([a, b]) => (
                <div className="rounded-xl bg-slate-950 p-3" key={a}>
                  <div className="text-xs text-slate-500">{a}</div>
                  <div className="mt-1 font-bold">{b}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 font-bold"><CheckCircle2 size={18} /> AI analysis</div>
            <p className="muted mt-3 leading-7">{v.explanation}</p>
          </div>
        </div>
      </div>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-bold">Evidence</h2>
          <div className="mt-5 space-y-4">
            {v.evidence.length === 0 && <p className="muted">No external evidence was retrieved.</p>}
            {v.evidence.map((e, i) => (
              <div className="rounded-xl border border-slate-800 p-4" key={`${e.source}-${e.url || i}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs font-bold ${e.type === "SUPPORTS" ? "text-emerald-300" : e.type === "CONTRADICTS" ? "text-red-300" : "text-slate-300"}`}>
                    {e.type === "SUPPORTS" ? "✓ SUPPORTS CLAIM" : e.type === "CONTRADICTS" ? "× CONTRADICTS CLAIM" : "• SEARCH EVIDENCE"}
                  </span>
                  <span className="text-xs text-slate-500">{e.reliability}/100</span>
                </div>
                <div className="mt-3 font-semibold">{e.source}</div>
                {e.title && <div className="mt-1 text-sm text-slate-300">{e.title}</div>}
                <p className="muted mt-2 text-sm leading-6">{e.text}</p>
                {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-1 text-xs underline">View source <ArrowUpRight size={12} /></a>}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold">Blockchain verification</h2>
          <div className="mt-5 space-y-3">
            {[
              ["Verification ID", v.id],
              ["Content hash", v.content_hash],
              ["Network", v.blockchain_network],
              ["Transaction", v.transaction_hash || "Pending/demo record"],
              ["Recorded", date],
            ].map(([a, b]) => (
              <div className="flex items-center justify-between gap-4 border-b border-slate-800 py-3 text-sm" key={a}>
                <span className="text-slate-500">{a}</span><span className="max-w-[65%] break-all text-right font-medium">{b}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-300"><Link2 size={16} /> Verification record preserved</div>
          {v.source_url && <a href={v.source_url} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-sm underline">Open submitted source <ExternalLink size={14} /></a>}
        </div>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-xl font-bold">Verification timeline</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {["News submitted", "AI analysis completed", "Evidence collected", "Blockchain record created"].map((x, i) => (
            <div key={x} className="rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">{i === 3 ? <Link2 size={16} /> : <Clock3 size={16} />} {x}</div>
              <div className="muted mt-2 text-xs">{date}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-5 p-6">
        <div className="flex items-center gap-2 font-bold"><Users size={18} /> Community assessment</div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-white" style={{ width: `${v.community_agreement}%` }} /></div>
        <div className="mt-3 text-sm"><b>{v.community_agreement}%</b> current agreement</div>
      </section>
    </main>
  );
}
