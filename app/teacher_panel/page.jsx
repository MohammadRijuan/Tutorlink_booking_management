"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Plus, Search, Filter, GraduationCap, Phone, MessageCircle, Loader2, ChevronDown, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from '@/components/ProtectedRoute';

const PAGE_SIZE = 12;

const normalizeInputValue = (value) => String(value || '').trim().toLowerCase();

function TeacherPanelPageContent() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    fbWapp: "",
    varsity: "",
    phone: "",
    location: "",
    tag: "",
  });

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/teachers");
      const data = await res.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const uniqueLocations = useMemo(() => {
    const map = new Map();
    teachers.forEach((teacher) => {
      const value = normalizeInputValue(teacher.location);
      if (value && !map.has(value)) {
        map.set(value, value);
      }
    });
    return Array.from(map.keys()).sort();
  }, [teachers]);

  const uniqueTags = useMemo(() => {
    const map = new Map();
    teachers.forEach((teacher) => {
      const value = normalizeInputValue(teacher.tag);
      if (value && !map.has(value)) {
        map.set(value, value);
      }
    });
    return Array.from(map.keys()).sort();
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const query = search.toLowerCase();

    return teachers.filter((teacher) => {
      const normalizedLocation = normalizeInputValue(teacher.location);
      const normalizedTag = normalizeInputValue(teacher.tag);
      const matchesSearch = [teacher.name, teacher.varisty, teacher.location, teacher.tag, teacher.phone, teacher.fbWapp]
        .some((value) => (value || "").toLowerCase().includes(query));

      const matchesLocation = locationFilter === "All" || normalizedLocation === normalizeInputValue(locationFilter);
      const matchesTag = tagFilter === "All" || normalizedTag === normalizeInputValue(tagFilter);

      return matchesSearch && matchesLocation && matchesTag;
    });
  }, [teachers, search, locationFilter, tagFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));

  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTeachers.slice(start, start + PAGE_SIZE);
  }, [filteredTeachers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, locationFilter, tagFilter]);

  const resetForm = () => {
    setForm({
      name: "",
      fbWapp: "",
      varsity: "",
      phone: "",
      location: "",
      tag: "",
    });
    setEditingTeacher(null);
  };

  const normalizedForm = {
    ...form,
    location: normalizeInputValue(form.location),
    tag: normalizeInputValue(form.tag),
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setForm({
      name: teacher.name,
      fbWapp: teacher.fbWapp,
      varsity: teacher.varsity,
      phone: teacher.phone,
      location: teacher.location,
      tag: teacher.tag,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      name: form.name.trim(),
      fbWapp: form.fbWapp.trim(),
      varsity: form.varsity.trim(),
      phone: form.phone.trim(),
      location: normalizeInputValue(form.location),
      tag: normalizeInputValue(form.tag),
      id: editingTeacher?._id,
    };

    if (!payload.name || !payload.fbWapp || !payload.varsity || !payload.phone || !payload.location || !payload.tag) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/teachers", {
        method: editingTeacher ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      toast.success(editingTeacher ? "Teacher updated successfully" : "Teacher added successfully");
      setShowModal(false);
      resetForm();
      fetchTeachers();
    } catch (error) {
      toast.error(error.message || "Something Went Wrong");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/teachers?id=${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      toast.success("Teacher deleted successfully");
      setDeleteId(null);
      fetchTeachers();
    } catch (error) {
      toast.error(error.message || "Something Went Wrong");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.12),_transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-brand-500/15 p-3 text-brand-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <Link href="/home" className="mb-2 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Back to home
              </Link>
              <h1 className="text-2xl font-semibold">Teacher Panel</h1>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Teacher directory</p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-500"
          >
            <Plus className="h-4 w-4" /> Add Teacher
          </button>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-soft backdrop-blur xl:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Teacher List</h2>
              <p className="text-sm text-slate-400">Search and filter by location and tag.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full appearance-none rounded-full border border-white/10 bg-slate-800/80 px-3 py-2.5 pr-8 text-sm text-slate-200 outline-none"
                >
                  <option value="All">All Locations</option>
                  {uniqueLocations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full appearance-none rounded-full border border-white/10 bg-slate-800/80 px-3 py-2.5 pr-8 text-sm text-slate-200 outline-none"
                >
                  <option value="All">All Tags</option>
                  {uniqueTags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search teacher..."
                  className="w-full bg-transparent text-sm outline-none sm:w-64"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-300">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading teachers...
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginatedTeachers.length === 0 ? (
                  <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-white/10 bg-slate-800/40 px-4 py-10 text-center text-slate-400">
                    No teacher found for this filter.
                  </div>
                ) : (
                  paginatedTeachers.map((teacher) => (
                    <article key={teacher._id} className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-soft">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{teacher.name}</h3>
                          <span className="mt-1 inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-300">
                            {teacher.tag}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(teacher)}
                            className="rounded-xl border border-white/10 bg-slate-800/70 p-2 text-slate-200 transition hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(teacher._id)}
                            className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-brand-400" />
                          <span>{teacher.varsity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand-400" />
                          <span>{teacher.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-brand-400" />
                          <span>{teacher.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-brand-400" />
                          <span>{teacher.fbWapp}</span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>

              {filteredTeachers.length > 0 && (
                <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-300">
                  <button
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</h3>
                <p className="text-sm text-slate-400">All required fields must be filled.</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              {[
                ["name", "Name"],
                ["fbWapp", "FB/Wapp"],
                ["varsity", "Varsity"],
                ["phone", "Phone"],
                ["location", "Location"],
                ["tag", "Tag"],
              ].map(([name, label]) => (
                <div key={name} className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-slate-300">{label}</label>
                  <input
                    required
                    value={form[name]}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setForm({
                        ...form,
                        [name]: name === 'location' || name === 'tag' ? nextValue.toLowerCase() : nextValue,
                      });
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              ))}

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-soft">
            <h3 className="text-xl font-semibold">Delete this teacher?</h3>
            <p className="mt-2 text-sm text-slate-400">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default function TeacherPanelPage() {
  return (
    <ProtectedRoute>
      <TeacherPanelPageContent />
    </ProtectedRoute>
  );
}
