"use client";

import { useState } from "react";
import { ArrowRight, FileText, Link2, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Verify() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function analyze() {
    const value = input.trim();
    if (!value) return;

    setLoading(true);
    setError("");

    try {
      const isUrl = /^https?:\/\//i.test(value);
      const response = await fetch(`${API_URL}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isUrl ? { url: value, claim: "" } : { claim: value }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || `API error: ${response.status}`);
      }
      if (!data.id) throw new Error("Backend did not return a verification ID.");

      // IMPORTANT: use the ID returned by the backend. Never use a fixed ID.
      router.push(`/results/${encodeURIComponent(data.id)}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to analyze this news.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container min-h-[calc(100vh-64px)] py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <div className="mx-auto w-fit rounded-xl border border-slate-700 p-3"><Search /></div>
          <h1 className="mt-5 text-4xl font-bold">Verify a news story</h1>
          <p className="muted mt-3">Paste a URL, headline, or claim and let the evidence guide the assessment.</p>
        </div>

        <div className="card p-5">
          <label className="mb-3 block text-sm font-medium">News URL or claim</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            placeholder="e.g. Paste a news URL or type a claim..."
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 outline-none focus:border-slate-400"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={analyze}
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              {loading ? <><Loader2 className="animate-spin" size={16} /> Analyzing...</> : <>Analyze News <ArrowRight size={16} /></>}
            </button>
          </div>
          {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[[FileText, "Claim extraction"], [Search, "Live evidence search"], [Link2, "Ledger record"]].map(([I, t]: any) => (
            <div className="card p-4" key={t}><I size={18} /><div className="mt-3 text-sm font-semibold">{t}</div></div>
          ))}
        </div>
      </div>
    </main>
  );
}
