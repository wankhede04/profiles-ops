import { useEffect, useState } from "react";
import { listApplications, updateApplicationStatus } from "../api/applications";
import Badge, { statusVariant } from "../components/Badge";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import type { Application, ApplicationStatus } from "../types/api";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "applied",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
];

function StatusSelect({
  app,
  onUpdate,
}: {
  app: Application;
  onUpdate: (updated: Application) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>(app.status);
  const [notes, setNotes] = useState(app.notes);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateApplicationStatus(app.id, { status, notes });
      onUpdate(updated);
      setEditing(false);
    } catch {
      // keep modal open on error
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="flex items-center gap-1.5">
        <Badge label={status} variant={statusVariant(status)} />
        <span className="text-xs text-gray-400 hover:text-gray-600">edit</span>
      </button>
    );
  }

  return (
    <div className="space-y-2 min-w-[200px]">
      <select
        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none"
        value={status}
        onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      <textarea
        className="w-full text-xs border border-gray-200 rounded p-1.5 resize-none focus:outline-none"
        rows={2}
        placeholder="Notes…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "…" : "Save"}
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listApplications()
      .then((data) => setApps(data.results))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (updated: Application) =>
    setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Every exported resume is logged here. Track your pipeline.
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      {apps.length === 0 && !error ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
          No applications yet. Export a tailored resume to log one.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Profile", "Role", "Company", "Date", "Status", "PDF", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-indigo-600 whitespace-nowrap">
                    {app.profile_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                    {app.job_title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                    {app.company}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(app.date_applied).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusSelect app={app} onUpdate={handleUpdate} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {app.pdf_path ? (
                      <span className="text-xs text-gray-400 font-mono truncate max-w-[120px] block">
                        {app.pdf_path.split("/").pop()}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {app.notes && (
                      <span className="text-xs italic">{app.notes}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
