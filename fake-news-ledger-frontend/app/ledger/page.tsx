"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Ledger() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/verify`)
      .then((r) => r.json())
      .then(setRows)
      .catch(console.error);
  }, []);

  const filtered = rows.filter((x) =>
    x.claim?.toLowerCase().includes(q.toLowerCase()) || x.id?.toLowerCase().includes(q.toLowerCase())
  );

  return <main className="container py-10">
    <h1 className="text-3xl font-bold">Verification Ledger</h1>
    <p className="muted mt-2">A searchable history of evidence-based assessments.</p>
    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search verification ID or claim..." className="mt-7 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 outline-none" />
    <div className="card mt-5 overflow-hidden">
      <div className="hidden grid-cols-[130px_1fr_130px_180px_90px] gap-4 border-b border-slate-800 p-4 text-xs text-slate-500 md:grid"><span>ID</span><span>Claim</span><span>Assessment</span><span>Date</span><span>Chain</span></div>
      {filtered.map((x) => <Link href={`/results/${x.id}`} key={x.id} className="grid gap-3 border-b border-slate-800 p-4 hover:bg-slate-900 md:grid-cols-[130px_1fr_130px_180px_90px] md:items-center"><span className="text-xs font-mono text-slate-400">{x.id}</span><span className="text-sm">{x.claim}</span><StatusBadge status={x.status} /><span className="text-xs text-slate-500">{new Date(x.created_at).toLocaleString()}</span><span className="text-xs text-emerald-300">✓ Recorded</span></Link>)}
      {filtered.length === 0 && <div className="p-6 text-sm text-slate-500">No verification records found.</div>}
    </div>
  </main>;
}
