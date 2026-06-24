"use client";

import { useEffect, useMemo, useState } from "react";

type Expense = { id: string; title: string; description?: string; amount: number; currency: string; paidById: string; createdAt: string };
type Member = { id: string; name: string };

export function WorkspaceExpenseTracker({ projectId, members }: { projectId: string; members: Member[] }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Loading expenses…");
  const memberNames = new Map(members.map((member) => [member.id, member.name]));
  const total = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const response = await fetch(`/api/expenses?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error ?? "Could not load expenses.");
        setExpenses(data.expenses);
        setStatus(data.expenses.length ? "Up to date" : "No expenses yet");
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "Could not load expenses.");
      }
    }
    void hydrate();
    return () => { cancelled = true; };
  }, [projectId]);

  async function addExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !amount) return;
    setStatus("Saving expense…");
    const response = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, title, amount, currency: "USD" }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus(data.error ?? "Could not add the expense."); return; }
    setExpenses((current) => [data.expense, ...current]);
    setTitle("");
    setAmount("");
    setStatus("Up to date");
  }

  return <section className="min-h-[560px] rounded-3xl border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-indigo-950/10 backdrop-blur md:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">Project expense tracker</p><h2 className="mt-2 text-2xl font-semibold text-white">Keep spending visible</h2><p className="mt-2 text-sm text-slate-400">Record team costs and see the running total for this project.</p></div><div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">Total recorded</p><p className="mt-1 text-2xl font-semibold text-emerald-100">${total.toFixed(2)}</p></div></div>
    <form onSubmit={addExpense} className="mt-7 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_160px_auto]"><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="e.g. Domain renewal" className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-300" /><input value={amount} onChange={(event) => setAmount(event.target.value)} min="0.01" step="0.01" type="number" placeholder="Amount (USD)" className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-300" /><button className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-violet-100">Add expense</button></form>
    <div className="mt-4 flex justify-between text-xs text-slate-400"><span>{status}</span><span>{expenses.length} item{expenses.length === 1 ? "" : "s"}</span></div>
    <div className="mt-5 space-y-3">{expenses.map((expense) => <article key={expense.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="min-w-0"><p className="truncate font-medium text-white">{expense.title}</p><p className="mt-1 text-sm text-slate-400">Paid by {memberNames.get(expense.paidById) ?? "Team member"} · {new Date(expense.createdAt).toLocaleDateString()}</p></div><p className="whitespace-nowrap text-lg font-semibold text-white">${expense.amount.toFixed(2)}</p></article>)}</div>
    {!expenses.length && status !== "Loading expenses…" && <p className="mt-10 text-center text-sm text-slate-500">Add the first shared cost when your team starts spending.</p>}
  </section>;
}
