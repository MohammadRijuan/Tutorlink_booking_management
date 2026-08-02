"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

function CashManagementPageContent() {
  const [records, setRecords] = useState([]);
  const [cashEntries, setCashEntries] = useState([]);
  const [costEntries, setCostEntries] = useState([]);
  const [entryModalType, setEntryModalType] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [entryForm, setEntryForm] = useState({ title: "", amount: "" });

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/tuitions");
      const data = await res.json();
      setRecords(data.tuitions || []);
    } catch (error) {
      toast.error("Something Went Wrong");
    }
  };

  const fetchCashFlow = async () => {
    try {
      const res = await fetch("/api/cash-flow");
      const data = await res.json();
      const entries = data.entries || [];
      setCashEntries(entries.filter((entry) => entry.type === "cash"));
      setCostEntries(entries.filter((entry) => entry.type === "cost"));
    } catch (error) {
      toast.error("Failed to load cash flow data");
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchCashFlow();
  }, []);

  const overallRevenue = useMemo(
    () =>
      records
        .filter((record) => record.feeStatus === "Done")
        .reduce((total, record) => total + Number(record.agencyFee || 0), 0),
    [records],
  );

  const totalAddCash = useMemo(
    () =>
      cashEntries.reduce(
        (total, entry) => total + Number(entry.amount || 0),
        0,
      ),
    [cashEntries],
  );

  const totalCost = useMemo(
    () =>
      costEntries.reduce(
        (total, entry) => total + Number(entry.amount || 0),
        0,
      ),
    [costEntries],
  );

  const revenueLeft = overallRevenue + totalAddCash - totalCost;

  const openEntryModal = (type, entry = null) => {
    setEntryModalType(type);
    setEditingEntry(entry);
    setEntryForm({
      title: entry?.title || "",
      amount: entry?.amount || "",
    });
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = entryForm.title.trim();
    const parsedAmount = Number(entryForm.amount);

    if (!trimmedTitle || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid title and amount.");
      return;
    }

    try {
      const payload = {
        id: editingEntry?._id || editingEntry?.id,
        title: trimmedTitle,
        amount: parsedAmount,
        type: entryModalType,
      };

      const method = editingEntry ? "PATCH" : "POST";
      const res = await fetch("/api/cash-flow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      await fetchCashFlow();
      toast.success(
        editingEntry
          ? `${entryModalType === "cash" ? "Cash" : "Cost"} entry updated successfully`
          : `${entryModalType === "cash" ? "Cash" : "Cost"} entry saved successfully`,
      );
      setEntryForm({ title: "", amount: "" });
      setEditingEntry(null);
      setEntryModalType(null);
    } catch (error) {
      toast.error(error.message || "Something Went Wrong");
    }
  };

  const handleDeleteEntry = async () => {
    if (!deleteEntry?._id) return;

    try {
      const res = await fetch(
        `/api/cash-flow?id=${deleteEntry._id}&type=${deleteEntry.type}`,
        { method: "DELETE" },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      setDeleteEntry(null);
      await fetchCashFlow();
      toast.success("Entry deleted successfully");
    } catch (error) {
      toast.error(error.message || "Something Went Wrong");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.12),_transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-soft backdrop-blur xl:flex-row xl:items-center xl:justify-between xl:p-6">
          <div>
            <Link href="/home" className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to records
            </Link>
            <h1 className="text-2xl font-semibold">Cash Management</h1>
            <p className="text-sm text-slate-400">Track incoming cash and business costs in one place.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2.5 font-medium text-slate-200 transition hover:border-brand-500/40 hover:text-white">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-soft backdrop-blur xl:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Cash & Expense Overview</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => openEntryModal("cash")}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-500"
              >
                <Plus className="h-4 w-4" /> Add Cash
              </button>
              <button
                onClick={() => openEntryModal("cost")}
                className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 font-semibold text-white transition hover:bg-rose-500"
              >
                <Plus className="h-4 w-4" /> Add Cost
              </button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-emerald-300">Cash</h3>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-sm font-medium text-emerald-200">
                  Total: TK {totalAddCash.toLocaleString()}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/10">
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-900/95 text-slate-400 backdrop-blur">
                    <tr>
                      <th className="px-3 py-3 text-left font-medium">Date</th>
                      <th className="px-3 py-3 text-left font-medium">Title</th>
                      <th className="px-3 py-3 text-center font-medium">Amount</th>
                      <th className="px-3 py-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-slate-900/30">
                    {cashEntries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-slate-400">No cash added yet.</td>
                      </tr>
                    ) : (
                      cashEntries.map((entry) => (
                        <tr key={entry._id || entry.id} className="hover:bg-slate-800/30">
                          <td className="px-3 py-3 text-slate-300">{new Date(entry.createdAt).toLocaleDateString()}</td>
                          <td className="px-3 py-3 text-slate-200">{entry.title}</td>
                          <td className="px-3 py-3 text-center font-medium text-emerald-300">TK {Number(entry.amount).toLocaleString()}</td>
                          <td className="px-3 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEntryModal("cash", entry)}
                                className="rounded-xl border border-white/10 bg-slate-800/70 p-2 text-slate-200 transition hover:text-white"
                                title="Edit cash"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteEntry({ ...entry, type: "cash" })}
                                className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20"
                                title="Delete cash"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-slate-950/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-rose-300">Cost</h3>
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-sm font-medium text-rose-200">
                  Total: TK {totalCost.toLocaleString()}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/10">
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-900/95 text-slate-400 backdrop-blur">
                    <tr>
                      <th className="px-3 py-3 text-left font-medium">Date</th>
                      <th className="px-3 py-3 text-left font-medium">Title</th>
                      <th className="px-3 py-3 text-center font-medium">Amount</th>
                      <th className="px-3 py-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-slate-900/30">
                    {costEntries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-slate-400">No cost added yet.</td>
                      </tr>
                    ) : (
                      costEntries.map((entry) => (
                        <tr key={entry._id || entry.id} className="hover:bg-slate-800/30">
                          <td className="px-3 py-3 text-slate-300">{new Date(entry.createdAt).toLocaleDateString()}</td>
                          <td className="px-3 py-3 text-slate-200">{entry.title}</td>
                          <td className="px-3 py-3 text-center font-medium text-rose-300">TK {Number(entry.amount).toLocaleString()}</td>
                          <td className="px-3 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEntryModal("cost", entry)}
                                className="rounded-xl border border-white/10 bg-slate-800/70 p-2 text-slate-200 transition hover:text-white"
                                title="Edit cost"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteEntry({ ...entry, type: "cost" })}
                                className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20"
                                title="Delete cost"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="mt-1 text-2xl font-semibold text-white">Revenue Calculation</h3>
              </div>
              <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-brand-300">
                Formula: (Overall Revenue + Total Add Cash) - Total Cost
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-sm text-slate-400">Overall Revenue</p>
                <p className="mt-2 text-2xl font-semibold text-white">TK {overallRevenue.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-sm text-slate-400">Total Add Cash</p>
                <p className="mt-2 text-2xl font-semibold text-white">TK {totalAddCash.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-sm text-slate-400">Total Cost</p>
                <p className="mt-2 text-2xl font-semibold text-white">TK {totalCost.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-sm text-emerald-300">Revenue left after calculation</p>
              <p className="mt-2 text-3xl font-semibold text-white">TK {revenueLeft.toLocaleString()}</p>
            </div>
          </div>
        </section>
      </div>

      {entryModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">
                  {editingEntry
                    ? `Edit ${entryModalType === "cash" ? "Cash" : "Cost"}`
                    : entryModalType === "cash"
                      ? "Add Cash"
                      : "Add Cost"}
                </h3>
                <p className="text-sm text-slate-400">
                  {editingEntry
                    ? "Update the selected entry."
                    : entryModalType === "cash"
                      ? "Add a new cash entry."
                      : "Add a new cost entry."}
                </p>
              </div>
              <button
                onClick={() => {
                  setEntryModalType(null);
                  setEditingEntry(null);
                }}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleEntrySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Title</label>
                <input
                  type="text"
                  value={entryForm.title}
                  onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                  placeholder="e.g. Tuition Collection"
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={entryForm.amount}
                  onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEntryModalType(null);
                    setEditingEntry(null);
                  }}
                  className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
                >
                  {editingEntry ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-soft">
            <h3 className="text-xl font-semibold">
              Delete this {deleteEntry.type === "cash" ? "cash" : "cost"}?
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteEntry(null)}
                className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEntry}
                className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CashManagementPage() {
  return (
    <ProtectedRoute>
      <CashManagementPageContent />
    </ProtectedRoute>
  );
}
