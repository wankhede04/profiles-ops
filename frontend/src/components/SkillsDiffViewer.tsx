import type { SkillsDiff } from "../types/api";

interface Props {
  diff: SkillsDiff;
}

export default function SkillsDiffViewer({ diff }: Props) {
  if (!diff.changed) {
    return <p className="text-sm text-gray-400 italic">No changes to skills</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {diff.removed.map((skill) => (
        <span
          key={`rem-${skill}`}
          className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 line-through ring-1 ring-red-200"
        >
          <span className="font-bold">−</span> {skill}
        </span>
      ))}
      {diff.unchanged.map((skill) => (
        <span
          key={`unc-${skill}`}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
        >
          {skill}
        </span>
      ))}
      {diff.added.map((skill) => (
        <span
          key={`add-${skill}`}
          className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-200"
        >
          <span className="font-bold">+</span> {skill}
        </span>
      ))}
    </div>
  );
}
