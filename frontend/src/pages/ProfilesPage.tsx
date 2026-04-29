import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProfiles } from "../api/profiles";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import type { Profile } from "../types/api";

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listProfiles()
      .then((data) => setProfiles(data.results))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profiles</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Each profile stores a resume split into locked and editable sections.
          </p>
        </div>
        <Link
          to="/profiles/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span> New Profile
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}

      {profiles.length === 0 && !error ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 text-sm">No profiles yet.</p>
          <Link
            to="/profiles/new"
            className="mt-3 inline-block text-indigo-600 text-sm font-medium hover:underline"
          >
            Create your first profile →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{p.locked_data.name}</p>
                  <p className="text-xs text-indigo-600 font-mono mt-0.5">{p.profile_id}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {p.editable_data.summary}
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {p.editable_data.skills.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                  >
                    {s}
                  </span>
                ))}
                {p.editable_data.skills.length > 4 && (
                  <span className="text-xs text-gray-400">
                    +{p.editable_data.skills.length - 4}
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/profiles/${p.profile_id}`}
                  className="flex-1 text-center text-xs font-medium text-gray-600 hover:text-indigo-600 transition-colors py-1"
                >
                  View
                </Link>
                <Link
                  to={`/profiles/${p.profile_id}/tailor`}
                  className="flex-1 text-center text-xs font-medium bg-indigo-600 text-white rounded-md py-1 hover:bg-indigo-700 transition-colors"
                >
                  Tailor Resume
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
