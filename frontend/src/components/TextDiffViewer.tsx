import type { DiffLine, TextDiff } from "../types/api";

interface Props {
  diff: TextDiff;
  label?: string;
}

function Line({ line }: { line: DiffLine }) {
  if (line.type === "removed") {
    return (
      <div className="flex bg-red-50 font-mono text-sm">
        <span className="w-6 shrink-0 text-red-400 select-none text-center">-</span>
        <span className="text-red-800 whitespace-pre-wrap break-words flex-1 px-1">{line.content}</span>
      </div>
    );
  }
  if (line.type === "added") {
    return (
      <div className="flex bg-green-50 font-mono text-sm">
        <span className="w-6 shrink-0 text-green-500 select-none text-center">+</span>
        <span className="text-green-800 whitespace-pre-wrap break-words flex-1 px-1">{line.content}</span>
      </div>
    );
  }
  return (
    <div className="flex bg-white font-mono text-sm">
      <span className="w-6 shrink-0 text-gray-300 select-none text-center"> </span>
      <span className="text-gray-600 whitespace-pre-wrap break-words flex-1 px-1">{line.content}</span>
    </div>
  );
}

export default function TextDiffViewer({ diff, label }: Props) {
  if (!diff.changed) {
    return (
      <div className="text-sm text-gray-400 italic py-1">
        {label ? `${label}: ` : ""}No changes
      </div>
    );
  }

  return (
    <div className="rounded border border-gray-200 overflow-hidden">
      {label && (
        <div className="bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
          {label}
        </div>
      )}
      <div className="divide-y divide-gray-100">
        {diff.lines.map((line, i) => (
          <Line key={i} line={line} />
        ))}
      </div>
    </div>
  );
}
