"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, CircleDollarSign, BadgeCheck, CircleOff, BarChart3, ChevronDown } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedRoute from '@/components/ProtectedRoute';

const statCards = [
  { label: 'Total Tuitions', key: 'total' },
  { label: 'Total Booked', key: 'booked' },
  { label: 'Total Pending', key: 'pending' },
  { label: 'Total Cancelled', key: 'cancelled' },
  { label: 'Pending Agency Fees', key: 'pendingFees' },
];

function DashboardPageContent() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedRange, setSelectedRange] = useState('1');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/tuitions');
        const data = await res.json();
        setRecords(data.tuitions || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const booked = records.filter((r) => r.bookingStatus === 'Booked').length;
    const pending = records.filter((r) => r.bookingStatus === 'Pending').length;
    const cancelled = records.filter((r) => r.bookingStatus === 'Cancelled').length;
    const revenue = records.filter((r) => r.feeStatus === 'Done').reduce((acc, r) => acc + Number(r.agencyFee || 0), 0);
    const cancelledFee = records.filter((r) => r.bookingStatus === 'Cancelled').reduce((acc, r) => acc + Number(r.agencyFee || 0), 0);
    const pendingFees = records.filter((r) => r.feeStatus === 'Pending').reduce((acc, r) => acc + Number(r.agencyFee || 0), 0);
    const salaryTotal = records.reduce((acc, r) => acc + Number(r.salary || 0), 0);

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const currentMonthRevenue = records
      .filter((r) => r.feeStatus === 'Done')
      .filter((r) => {
        const createdAt = r.createdAt ? new Date(r.createdAt) : null;
        return createdAt && createdAt >= currentMonthStart && createdAt <= now;
      })
      .reduce((acc, r) => acc + Number(r.agencyFee || 0), 0);

    const previousMonthRevenue = records
      .filter((r) => r.feeStatus === 'Done')
      .filter((r) => {
        const createdAt = r.createdAt ? new Date(r.createdAt) : null;
        return createdAt && createdAt >= previousMonthStart && createdAt <= previousMonthEnd;
      })
      .reduce((acc, r) => acc + Number(r.agencyFee || 0), 0);

    return {
      total: records.length,
      booked,
      pending,
      cancelled,
      revenue,
      cancelledFee,
      pendingFees,
      salaryTotal,
      currentMonthRevenue,
      previousMonthRevenue,
    };
  }, [records]);

  const chartData = useMemo(() => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const rangeMonths = Number(selectedRange);
    const currentYear = new Date().getFullYear();
    const monthIndex = Number(selectedMonth);
    const startIndex = Math.max(0, monthIndex - (rangeMonths - 1));

    const data = [];
    for (let index = startIndex; index <= monthIndex; index += 1) {
      const monthName = months[index];
      const revenue = records.reduce((total, item) => {
        const date = new Date(item.createdAt);
        if (date.getFullYear() !== currentYear || date.getMonth() !== index) return total;
        return total + (item.feeStatus === 'Done' ? Number(item.agencyFee || 0) : 0);
      }, 0);

      const salary = records.reduce((total, item) => {
        const date = new Date(item.createdAt);
        if (date.getFullYear() !== currentYear || date.getMonth() !== index) return total;
        return total + Number(item.salary || 0);
      }, 0);

      data.push({ month: monthName, Revenue: revenue, Salary: salary });
    }

    return data;
  }, [records, selectedMonth, selectedRange]);

  const monthOptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.12),_transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/home" className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to records
            </Link>
            <h1 className="text-2xl font-semibold">Business Dashboard</h1>
            <p className="text-sm text-slate-400">Track tuition activity, fees, and progress in real time.</p>
          </div>
          <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3 text-brand-300">
            <div className="flex items-center gap-2 font-semibold">
              <TrendingUp className="h-5 w-5" /> Premium overview
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card) => (
            <div key={card.key} className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-soft backdrop-blur">
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stats[card.key]}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center gap-2 text-sky-300">
              <CircleDollarSign className="h-5 w-5" /> Current Month Revenue
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">TK {stats.currentMonthRevenue.toLocaleString()}</p>
          </div>
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center gap-2 text-violet-300">
              <TrendingUp className="h-5 w-5" /> Previous Month Revenue
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">TK {stats.previousMonthRevenue.toLocaleString()}</p>
          </div>
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center gap-2 text-sky-300">
              <CircleDollarSign className="h-5 w-5" />Overall Revenue
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">TK {stats.revenue.toLocaleString()}</p>
          </div>
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center gap-2 text-amber-300">
              <BadgeCheck className="h-5 w-5" /> Total Tuition Salary
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">TK {stats.salaryTotal.toLocaleString()}</p>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center gap-2 text-rose-300">
              <CircleOff className="h-5 w-5" /> Cancelled Fee
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">TK {stats.cancelledFee.toLocaleString()}</p>
          </div>
        </section>


        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-soft backdrop-blur">
          <div className="mb-5 flex flex-col gap-5 lg:gap-3 lg:flex-row lg:items-center lg:justify-between text-slate-200">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-400" /> Revenue vs Salary Trend
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-auto">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full appearance-none rounded-full border border-white/10 bg-slate-800/80 px-3 py-2 pr-8 text-sm text-slate-200 outline-none"
                  >
                    {monthOptions.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="relative w-full sm:w-auto">
                  <select
                    value={selectedRange}
                    onChange={(e) => setSelectedRange(e.target.value)}
                    className="w-full appearance-none rounded-full border border-white/10 bg-slate-800/80 px-3 py-2 pr-8 text-sm text-slate-200 outline-none"
                  >
                    <option value="1">1 month</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Revenue</span>
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Salary</span>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="h-72 rounded-2xl border border-dashed border-white/10 bg-slate-800/40" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-4 sm:px-4 sm:py-6">
              <div className={`h-72 ${selectedRange !== '1' ? 'min-w-[320px] sm:min-w-0' : ''}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} minTickGap={2} interval="preserveStartEnd" />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={76} />
                    <Tooltip
                      cursor={{ fill: 'rgba(34, 197, 94, 0.06)' }}
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e2e8f0' }}
                      labelStyle={{ color: '#f8fafc' }}
                    />
                    <Bar dataKey="Revenue" radius={[4, 4, 0, 0]} fill="#22c55e" maxBarSize={24} />
                    <Bar dataKey="Salary" radius={[4, 4, 0, 0]} fill="#38bdf8" maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
