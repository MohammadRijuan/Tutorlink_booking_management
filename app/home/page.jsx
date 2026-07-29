"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, LayoutDashboard, Pencil, Trash2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

const badgeStyles = {
  Booked: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  Pending: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  Cancelled: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
};

const feeStyles = {
  Done: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
  Pending: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
};

function HomePageContent() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    tuitionCode: '',
    tutorName: '',
    tutorMobile: '',
    guardianName: '',
    guardianMobile: '',
    guardianFacebook: '',
    salary: '',
    agencyFee: '',
    feeStatus: 'Pending',
    bookingStatus: 'Pending',
  });

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/tuitions');
      const data = await res.json();
      setRecords(data.tuitions || []);
    } catch (error) {
      toast.error('Something Went Wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase();
    return records.filter((record) => {
      return [
        record.tuitionCode,
        record.tutorName,
        record.guardianName,
        record.guardianMobile,
      ].some((value) => (value || '').toLowerCase().includes(query));
    });
  }, [records, search]);

  const resetForm = () => {
    setForm({
      tuitionCode: '',
      tutorName: '',
      tutorMobile: '',
      guardianName: '',
      guardianMobile: '',
      guardianFacebook: '',
      salary: '',
      agencyFee: '',
      feeStatus: 'Pending',
      bookingStatus: 'Pending',
    });
    setEditingRecord(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setForm({
      tuitionCode: record.tuitionCode,
      tutorName: record.tutorName,
      tutorMobile: record.tutorMobile,
      guardianName: record.guardianName,
      guardianMobile: record.guardianMobile,
      guardianFacebook: record.guardianFacebook,
      salary: record.salary,
      agencyFee: record.agencyFee,
      feeStatus: record.feeStatus,
      bookingStatus: record.bookingStatus,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        id: editingRecord?._id,
        salary: Number(form.salary),
        agencyFee: Number(form.agencyFee),
      };

      const url = editingRecord ? '/api/tuitions' : '/api/tuitions';
      const method = editingRecord ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');

      toast.success(editingRecord ? 'Tuition Updated Successfully' : 'Tuition Added Successfully');
      setShowModal(false);
      resetForm();
      fetchRecords();
    } catch (error) {
      toast.error(error.message || 'Something Went Wrong');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tuitions?id=${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast.success('Tuition Deleted Successfully');
      setDeleteId(null);
      fetchRecords();
    } catch (error) {
      toast.error(error.message || 'Something Went Wrong');
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.12),_transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-soft backdrop-blur xl:flex-row xl:items-center xl:justify-between xl:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-500/15 p-3 text-brand-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Tutorlink Media</h1>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Booking Management</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2.5 font-medium text-slate-200 transition hover:border-brand-500/40 hover:text-white">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <button onClick={openAddModal} className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-500">
              <Plus className="h-4 w-4" /> Add Row
            </button>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-soft backdrop-blur xl:p-6">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Tuition Records</h2>
              <p className="text-sm text-slate-400">Manage bookings, salaries, and fee collection from one place.</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code, tutor, guardian..."
                className="w-full bg-transparent text-sm outline-none sm:w-72"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-800/50 py-12">
              <div className="flex items-center gap-2 text-slate-300">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading tuition records...
              </div>
            </div>
          ) : (
            <div className="max-h-[100vh] overflow-auto rounded-2xl border border-white/10">
              <table className="min-w-[820px] md:min-w-[820px] lg:min-w-full divide-y divide-white/10 text-sm">
                <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
                  <tr className="text-left text-slate-400">
                    <th className="px-3 py-3 font-medium">Tuition Code</th>
                    <th className="px-3 py-3 font-medium">Tutor</th>
                    <th className="px-3 py-3 font-medium">Guardian</th>
                    <th className="px-3 py-3 font-medium">Salary</th>
                    <th className="px-3 py-3 font-medium">Agency Fee</th>
                    <th className="px-3 py-3 font-medium">Fee Status</th>
                    <th className="px-3 py-3 font-medium">Booking Status</th>
                    <th className="px-3 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="bg-slate-900/20 transition hover:bg-slate-800/40">
                      <td className="px-3 py-3 font-semibold text-white">{record.tuitionCode}</td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-200">{record.tutorName}</div>
                        <div className="text-slate-400">{record.tutorMobile}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-200">{record.guardianName || record.guardianFacebook || "N/A"}</div>
                        <div className="text-slate-400">{record.guardianMobile}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-200">TK {Number(record.salary).toLocaleString()}</td>
                      <td className="px-3 py-3 text-slate-200">TK {Number(record.agencyFee).toLocaleString()}</td>
                      <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${feeStyles[record.feeStatus] || feeStyles.Pending}`}>{record.feeStatus}</span></td>
                      <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeStyles[record.bookingStatus] || badgeStyles.Pending}`}>{record.bookingStatus}</span></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(record)} className="rounded-xl border border-white/10 bg-slate-800/70 p-2 text-slate-200 transition hover:text-white"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(record._id)} className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{editingRecord ? 'Edit Tuition' : 'Add New Tuition'}</h3>
                <p className="text-sm text-slate-400">Fill in the tuition details below.</p>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300">Close</button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              {[
                ['tuitionCode', 'Tuition Code'],
                ['tutorName', 'Tutor Name'],
                ['tutorMobile', 'Tutor Mobile'],
                ['guardianName', 'Guardian Name'],
                ['guardianMobile', 'Guardian Mobile'],
                ['guardianFacebook', 'Guardian Facebook'],
              ].map(([name, label]) => (
                <div key={name} className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">{label}</label>
                  <input
                    required={['tuitionCode','tutorName','tutorMobile','guardianName','guardianMobile'].includes(name)}
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              ))}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Salary</label>
                <input type="number" min="1" required value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Agency Fee</label>
                <input type="number" min="0" required value={form.agencyFee} onChange={(e) => setForm({ ...form, agencyFee: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Fee Status</label>
                <select value={form.feeStatus} onChange={(e) => setForm({ ...form, feeStatus: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                  <option value="Pending">Pending</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Booking Status</label>
                <select value={form.bookingStatus} onChange={(e) => setForm({ ...form, bookingStatus: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                  <option value="Pending">Pending</option>
                  <option value="Booked">Booked</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-slate-300">Cancel</button>
                <button type="submit" className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-soft">
            <h3 className="text-xl font-semibold">Delete this tuition?</h3>
            <p className="mt-2 text-sm text-slate-400">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-slate-300">Cancel</button>
              <button onClick={handleDelete} className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500">Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomePageContent />
    </ProtectedRoute>
  );
}
