import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile } from "../api/profiles";
import ErrorAlert from "../components/ErrorAlert";

const EMPTY_PROFILE = {
  profile_id: "",
  locked_data: {
    name: "",
    contact: { email: "", phone: "", location: "", linkedin: "", github: "" },
    education: [{ degree: "", institution: "", year: "" }],
  },
  editable_data: {
    summary: "",
    skills: "",
    experience: [
      { company: "", role: "", start_date: "", end_date: "", bullets: "" },
    ],
    projects: [{ name: "", description: "", tech_stack: "", bullets: "" }],
  },
};

type FormState = typeof EMPTY_PROFILE;

export default function ProfileFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY_PROFILE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLocked = (field: string, value: string) =>
    setForm((f) => ({
      ...f,
      locked_data: { ...f.locked_data, [field]: value },
    }));

  const setContact = (field: string, value: string) =>
    setForm((f) => ({
      ...f,
      locked_data: {
        ...f.locked_data,
        contact: { ...f.locked_data.contact, [field]: value },
      },
    }));

  const setEditable = (field: string, value: string) =>
    setForm((f) => ({
      ...f,
      editable_data: { ...f.editable_data, [field]: value },
    }));

  const setEdu = (i: number, field: string, value: string) =>
    setForm((f) => {
      const education = [...f.locked_data.education];
      education[i] = { ...education[i], [field]: value };
      return { ...f, locked_data: { ...f.locked_data, education } };
    });

  const setExp = (i: number, field: string, value: string) =>
    setForm((f) => {
      const experience = [...f.editable_data.experience];
      experience[i] = { ...experience[i], [field]: value };
      return { ...f, editable_data: { ...f.editable_data, experience } };
    });

  const setProj = (i: number, field: string, value: string) =>
    setForm((f) => {
      const projects = [...f.editable_data.projects];
      projects[i] = { ...projects[i], [field]: value };
      return { ...f, editable_data: { ...f.editable_data, projects } };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        profile_id: form.profile_id,
        locked_data: {
          ...form.locked_data,
          education: form.locked_data.education.filter((e) => e.degree),
        },
        editable_data: {
          summary: form.editable_data.summary,
          skills: form.editable_data.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          experience: form.editable_data.experience
            .filter((e) => e.company)
            .map((e) => ({
              ...e,
              bullets: e.bullets
                .split("\n")
                .map((b) => b.trim())
                .filter(Boolean),
            })),
          projects: form.editable_data.projects
            .filter((p) => p.name)
            .map((p) => ({
              ...p,
              bullets: p.bullets
                .split("\n")
                .map((b) => b.trim())
                .filter(Boolean),
            })),
        },
      };
      const created = await createProfile(payload);
      navigate(`/profiles/${created.profile_id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create profile");
    } finally {
      setSubmitting(false);
    }
  };

  const input =
    "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none";
  const label = "block text-sm font-medium text-gray-700";
  const section = "bg-white rounded-xl border border-gray-200 p-6 space-y-4";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Profile</h1>
      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile ID */}
        <div className={section}>
          <h2 className="text-base font-semibold text-gray-800">Profile ID</h2>
          <div>
            <label className={label}>Slug (e.g. vijay-backend)</label>
            <input
              required
              className={input}
              value={form.profile_id}
              onChange={(e) => setForm((f) => ({ ...f, profile_id: e.target.value }))}
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers and hyphens only"
            />
          </div>
        </div>

        {/* Locked — Contact */}
        <div className={section}>
          <h2 className="text-base font-semibold text-gray-800">
            Contact <span className="text-xs font-normal text-gray-400">(locked — AI won't change)</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {(["name"] as const).map((f) => (
              <div key={f} className="col-span-2">
                <label className={label}>Full Name</label>
                <input required className={input} value={form.locked_data.name} onChange={(e) => setLocked("name", e.target.value)} />
              </div>
            ))}
            {(["email", "phone", "location", "linkedin", "github"] as const).map((f) => (
              <div key={f}>
                <label className={label}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                <input
                  className={input}
                  required={f === "email"}
                  value={(form.locked_data.contact as Record<string, string>)[f]}
                  onChange={(e) => setContact(f, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Locked — Education */}
        <div className={section}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Education <span className="text-xs font-normal text-gray-400">(locked)</span></h2>
            <button type="button" className="text-xs text-indigo-600 hover:underline" onClick={() => setForm((f) => ({ ...f, locked_data: { ...f.locked_data, education: [...f.locked_data.education, { degree: "", institution: "", year: "" }] } }))}>
              + Add
            </button>
          </div>
          {form.locked_data.education.map((edu, i) => (
            <div key={i} className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={label}>Degree</label>
                <input className={input} value={edu.degree} onChange={(e) => setEdu(i, "degree", e.target.value)} />
              </div>
              <div>
                <label className={label}>Year</label>
                <input className={input} value={edu.year} onChange={(e) => setEdu(i, "year", e.target.value)} />
              </div>
              <div className="col-span-3">
                <label className={label}>Institution</label>
                <input className={input} value={edu.institution} onChange={(e) => setEdu(i, "institution", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        {/* Editable — Summary + Skills */}
        <div className={section}>
          <h2 className="text-base font-semibold text-gray-800">
            Summary & Skills <span className="text-xs font-normal text-gray-400">(editable — AI tailors these)</span>
          </h2>
          <div>
            <label className={label}>Summary</label>
            <textarea
              required
              rows={3}
              className={input}
              value={form.editable_data.summary}
              onChange={(e) => setEditable("summary", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Skills <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input className={input} value={form.editable_data.skills} onChange={(e) => setEditable("skills", e.target.value)} placeholder="Python, Django, PostgreSQL, Docker" />
          </div>
        </div>

        {/* Editable — Experience */}
        <div className={section}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Experience <span className="text-xs font-normal text-gray-400">(editable)</span></h2>
            <button type="button" className="text-xs text-indigo-600 hover:underline" onClick={() => setForm((f) => ({ ...f, editable_data: { ...f.editable_data, experience: [...f.editable_data.experience, { company: "", role: "", start_date: "", end_date: "", bullets: "" }] } }))}>
              + Add
            </button>
          </div>
          {form.editable_data.experience.map((exp, i) => (
            <div key={i} className="space-y-2 pt-2 border-t border-gray-100 first:border-0 first:pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Company</label>
                  <input className={input} value={exp.company} onChange={(e) => setExp(i, "company", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Role</label>
                  <input className={input} value={exp.role} onChange={(e) => setExp(i, "role", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Start Date</label>
                  <input className={input} placeholder="2021-06" value={exp.start_date} onChange={(e) => setExp(i, "start_date", e.target.value)} />
                </div>
                <div>
                  <label className={label}>End Date</label>
                  <input className={input} placeholder="Present" value={exp.end_date} onChange={(e) => setExp(i, "end_date", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={label}>Bullets <span className="text-gray-400 font-normal">(one per line)</span></label>
                <textarea rows={3} className={input} value={exp.bullets} onChange={(e) => setExp(i, "bullets", e.target.value)} placeholder="Led migration of monolith to microservices…" />
              </div>
            </div>
          ))}
        </div>

        {/* Editable — Projects */}
        <div className={section}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Projects <span className="text-xs font-normal text-gray-400">(editable)</span></h2>
            <button type="button" className="text-xs text-indigo-600 hover:underline" onClick={() => setForm((f) => ({ ...f, editable_data: { ...f.editable_data, projects: [...f.editable_data.projects, { name: "", description: "", tech_stack: "", bullets: "" }] } }))}>
              + Add
            </button>
          </div>
          {form.editable_data.projects.map((proj, i) => (
            <div key={i} className="space-y-2 pt-2 border-t border-gray-100 first:border-0 first:pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Name</label>
                  <input className={input} value={proj.name} onChange={(e) => setProj(i, "name", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Tech Stack</label>
                  <input className={input} value={proj.tech_stack} onChange={(e) => setProj(i, "tech_stack", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={label}>Description</label>
                <textarea rows={2} className={input} value={proj.description} onChange={(e) => setProj(i, "description", e.target.value)} />
              </div>
              <div>
                <label className={label}>Bullets <span className="text-gray-400 font-normal">(one per line)</span></label>
                <textarea rows={2} className={input} value={proj.bullets} onChange={(e) => setProj(i, "bullets", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating…" : "Create Profile"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
