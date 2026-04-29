import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tailorResume } from "../api/tailoring";
import ErrorAlert from "../components/ErrorAlert";

export default function TailorPage() {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    setLoading(true);
    setError(null);
    try {
      const version = await tailorResume(profileId, {
        job_title: jobTitle,
        company,
        jd_text: jdText,
      });
      navigate(`/profiles/${profileId}/versions/${version.id}/review`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Tailoring failed");
    } finally {
      setLoading(false);
    }
  };

  const input =
    "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none";
  const label = "block text-sm font-medium text-gray-700";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Tailor Resume</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Paste a job description — Claude will rewrite the editable sections to match.
      </p>

      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Job Title</label>
            <input
              required
              className={input}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Backend Engineer"
            />
          </div>
          <div>
            <label className={label}>Company</label>
            <input
              required
              className={input}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Startup Inc"
            />
          </div>
        </div>

        <div>
          <label className={label}>Job Description</label>
          <textarea
            required
            rows={14}
            className={input + " resize-none"}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here…"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Tailoring with Claude…
              </>
            ) : (
              "Tailor with AI →"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>

        {loading && (
          <p className="text-xs text-gray-400 italic">
            This usually takes 10–20 seconds. Claude is reading the JD and rewriting your resume…
          </p>
        )}
      </form>
    </div>
  );
}
