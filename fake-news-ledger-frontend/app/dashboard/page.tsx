"use client";

import { Activity, Award, FileCheck2, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Dashboard() {
  const [ledger, setLedger] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/verify`).then((r) => r.json()).then(setLedger).catch(console.error);
  }, []);

  return <main className="container py-10">
    <h1 className="text-3xl font-bold">Your Dashboard</h1>
    <p className="muted mt-2">Your verification and community activity.</p>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[[FileCheck2, "Articles checked", String(ledger.length)], [Activity, "Community reviews", "—"], [Award, "Reputation score", "—"], [Link2, "Blockchain records", String(ledger.length)]].map(([I, a, b]: any) => <div className="card p-5" key={a}><I size={20} /><div className="muted mt-4 text-sm">{a}</div><div className="mt-1 text-2xl font-bold">{b}</div></div>)}
    </div>
    <div className="card mt-5 p-6">
      <h2 className="text-xl font-bold">Recent verifications</h2>
      <div className="mt-4 space-y-2">
        {ledger.slice(0, 10).map((x) => <Link href={`/results/${x.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 p-4 hover:bg-slate-900" key={x.id}><span className="max-w-2xl text-sm">{x.claim}</span><StatusBadge status={x.status} /></Link>)}
        {ledger.length === 0 && <p className="muted text-sm">No verifications yet. Submit a news claim to create the first record.</p>}
      </div>
    </div>
  </main>;
}
