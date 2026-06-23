import Link from "next/link";
import { GitHubSignInButton } from "@/features/auth/components/github-sign-in-button";

export default function SignInPage() {
  return <main className="grid min-h-screen place-items-center px-5 py-10"><section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/20"><Link href="/" className="mb-10 flex items-center gap-2 font-semibold text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-400 font-black text-slate-950">M</span> Matchmaker</Link><p className="text-sm font-semibold uppercase tracking-wider text-teal-300">Your builder profile</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Sign in with the work you have already done.</h1><p className="mt-3 leading-6 text-slate-400">GitHub is the only sign-in method. It lets us build a trustworthy developer profile without asking you to recreate it.</p><div className="mt-8"><GitHubSignInButton /></div><p className="mt-6 text-center text-xs leading-5 text-slate-500">By continuing, you authorize GitHub sign-in. We only use profile information needed for your Matchmaker profile.</p></section></main>;
}
