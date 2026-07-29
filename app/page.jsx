"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, ArrowRight } from 'lucide-react';

const ACCESS_CODE = process.env.NEXT_PUBLIC_ACCESS_CODE || 'TUTORLINK511';

export default function AccessPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (code === ACCESS_CODE) {
      sessionStorage.setItem('tutorlink-access', 'granted');
      toast.success('Access granted');
      router.push('/home');
      return;
    }

    toast.error('Invalid Access Code');
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.2),_transparent_40%),linear-gradient(135deg,#020617_0%,#0f172a_100%)] px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-soft backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-brand-500/15 p-3 text-brand-400">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            {/* <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Tutorlink Media</p> */}
            <h1 className="text-2xl font-semibold text-white">Tutorlink Media</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Enter Access Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-3 text-white outline-none ring-0 transition focus:border-brand-500"
              placeholder="********"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Checking...' : 'Submit'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </main>
  );
}
