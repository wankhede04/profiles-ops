import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { exportVersion, finalizeVersion, getVersion } from "../api/tailoring";
import BulletsDiffViewer from "../components/BulletsDiffViewer";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import SkillsDiffViewer from "../components/SkillsDiffViewer";
import TextDiffViewer from "../components/TextDiffViewer";
import type { EditableData, ExperienceEntry, ProfileVersion, ProjectEntry } from "../types/api";

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

// ── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  title,
  changed,
  children,
}: {
  title: string;
  changed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className={`flex items-center justify-between px-5 py-3 border-b ${changed ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100"}`}>
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h3>
        {changed ? (
          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Changed</span>
        ) : (
          <span className="text-xs text-gray-400">Unchanged</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Editable bullets list ────────────────────────────────────────────────────

function BulletEditor({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}) {
  const updateBullet = (i: number, val: string) => {
    const next = [...bullets];
    next[i] = val;
    onChange(next);
  };
  const removeBullet = (i: number) => onChange(bullets.filter((_, idx) => idx !== i));
  const addBullet = () => onChange([...bullets, ""]);

  return (
    <div className="space-y-1.5">
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-2">
          <span className="mt-2 text-gray-400 text-sm shrink-0">•</span>
          <input
            className="flex-1 text-sm border border-gray-200 rounded px-2 py-1.5 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none"
            value={b}
            onChange={(e) => updateBullet(i, e.target.value)}
          />
          <button
            onClick={() => removeBullet(i)}
            className="text-gray-300 hover:text-red-400 text-lg mt-1 shrink-0"
            title="Remove"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addBullet}
        className="text-xs text-indigo-500 hover:text-indigo-700 mt-1"
      >
        + Add bullet
      </button>
    </div>
  );
}

// ── Skills tag editor ────────────────────────────────────────────────────────

function SkillsEditor({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const s = draft.trim();
    if (s && !skills.includes(s)) onChange([...skills, s]);
    setDraft("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {skills.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full"
          >
            {s}
            <button
              onClick={() => onChange(skills.filter((x) => x !== s))}
              className="text-indigo-300 hover:text-red-400 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="text-sm border border-gray-200 rounded px-2 py-1 focus:border-indigo-400 outline-none"
          placeholder="Add skill…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button
          onClick={add}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function DiffReviewPage() {
  const { profileId, versionId } = useParams<{ profileId: string; versionId: string }>();
  const navigate = useNavigate();

  const [version, setVersion] = useState<ProfileVersion | null>(null);
  const [final, setFinal] = useState<EditableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId || !versionId) return;
    getVersion(profileId, Number(versionId))
      .then((v) => {
        setVersion(v);
        setFinal(deepClone(v.final_editable ?? v.tailored_editable));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [profileId, versionId]);

  const useAI = (field: keyof EditableData) =>
    setFinal((f) => f && version ? { ...f, [field]: deepClone(version.tailored_editable[field]) } : f);

  const useOriginal = (field: keyof EditableData) =>
    setFinal((f) => f && version ? { ...f, [field]: deepClone(version.original_editable[field]) } : f);

  const updateSummary = (v: string) => setFinal((f) => f ? { ...f, summary: v } : f);
  const updateSkills = (skills: string[]) => setFinal((f) => f ? { ...f, skills } : f);

  const updateExpBullets = (i: number, bullets: string[]) =>
    setFinal((f) => {
      if (!f) return f;
      const experience = f.experience.map((e, idx) =>
        idx === i ? { ...e, bullets } : e
      ) as ExperienceEntry[];
      return { ...f, experience };
    });

  const updateProjBullets = (i: number, bullets: string[]) =>
    setFinal((f) => {
      if (!f) return f;
      const projects = f.projects.map((p, idx) =>
        idx === i ? { ...p, bullets } : p
      ) as ProjectEntry[];
      return { ...f, projects };
    });

  const updateProjDescription = (i: number, description: string) =>
    setFinal((f) => {
      if (!f) return f;
      const projects = f.projects.map((p, idx) =>
        idx === i ? { ...p, description } : p
      ) as ProjectEntry[];
      return { ...f, projects };
    });

  const handleExport = async () => {
    if (!profileId || !versionId || !final) return;
    setExporting(true);
    setError(null);
    try {
      // 1. Save edits
      await finalizeVersion(profileId, Number(versionId), final);
      // 2. Generate & download PDF
      const { blob, filename } = await exportVersion(profileId, Number(versionId));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      navigate("/applications");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading diff…" />;
  if (!version || !final) return <ErrorAlert message={error ?? "Version not found"} />;

  const diff = version.diff_snapshot;

  const fieldBar = (field: keyof EditableData) => (
    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
      <button onClick={() => useAI(field)} className="text-xs text-green-700 hover:underline">↑ Use AI version</button>
      <span className="text-gray-300">|</span>
      <button onClick={() => useOriginal(field)} className="text-xs text-red-600 hover:underline">↓ Use original</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diff Review</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            <span className="font-medium text-gray-700">{version.job_title}</span> at{" "}
            <span className="font-medium text-gray-700">{version.company}</span>
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {exporting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating PDF…
            </>
          ) : (
            "Finalize & Download PDF ↓"
          )}
        </button>
      </div>

      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

      {/* Legend */}
      <div className="flex items-center gap-4 mb-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-red-100 border border-red-300 rounded" /> Removed by AI
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-green-100 border border-green-300 rounded" /> Added by AI
        </span>
        <span className="flex items-center gap-1.5 ml-4 text-gray-400 italic">
          Right column = editable final version
        </span>
      </div>

      <div className="space-y-5">
        {/* ── Summary ── */}
        <Section title="Summary" changed={diff.summary?.changed ?? false}>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">AI Diff</p>
              <TextDiffViewer diff={diff.summary} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Final (editable)</p>
              <textarea
                className="w-full text-sm border border-gray-200 rounded-md p-2.5 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none resize-none"
                rows={5}
                value={final.summary}
                onChange={(e) => updateSummary(e.target.value)}
              />
              {fieldBar("summary")}
            </div>
          </div>
        </Section>

        {/* ── Skills ── */}
        <Section title="Skills" changed={diff.skills?.changed ?? false}>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">AI Diff</p>
              <SkillsDiffViewer diff={diff.skills} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Final (editable)</p>
              <SkillsEditor skills={final.skills} onChange={updateSkills} />
              {fieldBar("skills")}
            </div>
          </div>
        </Section>

        {/* ── Experience ── */}
        {diff.experience?.map((expDiff, i) => (
          <Section
            key={i}
            title={`${expDiff.role} · ${expDiff.company}`}
            changed={expDiff.changed}
          >
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">AI Diff</p>
                {expDiff.changed ? (
                  <BulletsDiffViewer bullets={expDiff.bullets} />
                ) : (
                  <p className="text-sm text-gray-400 italic">No changes to bullets</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Final (editable)</p>
                {final.experience[i] && (
                  <BulletEditor
                    bullets={final.experience[i].bullets}
                    onChange={(b) => updateExpBullets(i, b)}
                  />
                )}
              </div>
            </div>
          </Section>
        ))}

        {/* ── Projects ── */}
        {diff.projects?.map((projDiff, i) => (
          <Section key={i} title={`Project · ${projDiff.name}`} changed={projDiff.changed}>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">AI Diff</p>
                {projDiff.description.changed && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">Description</p>
                    <TextDiffViewer diff={projDiff.description} />
                  </div>
                )}
                {projDiff.bullets.some((b) => b.type !== "unchanged") && (
                  <BulletsDiffViewer bullets={projDiff.bullets} />
                )}
                {!projDiff.changed && <p className="text-sm text-gray-400 italic">No changes</p>}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Final (editable)</p>
                {final.projects[i] && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Description</label>
                      <textarea
                        className="w-full text-sm border border-gray-200 rounded p-2 focus:border-indigo-400 outline-none resize-none"
                        rows={2}
                        value={final.projects[i].description}
                        onChange={(e) => updateProjDescription(i, e.target.value)}
                      />
                    </div>
                    <BulletEditor
                      bullets={final.projects[i].bullets}
                      onChange={(b) => updateProjBullets(i, b)}
                    />
                  </div>
                )}
              </div>
            </div>
          </Section>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ← Back
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {exporting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating PDF…
            </>
          ) : (
            "Finalize & Download PDF ↓"
          )}
        </button>
      </div>
    </div>
  );
}
