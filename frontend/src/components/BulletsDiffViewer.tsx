import type { DiffLine } from "../types/api";

interface Props {
  bullets: DiffLine[];
}

export default function BulletsDiffViewer({ bullets }: Props) {
  return (
    <div className="rounded border border-gray-200 overflow-hidden">
      {bullets.map((b, i) => {
        if (b.type === "removed") {
          return (
            <div key={i} className="flex items-start gap-2 bg-red-50 px-3 py-1.5 border-b border-red-100 last:border-0">
              <span className="text-red-400 font-mono font-bold shrink-0 mt-0.5">−</span>
              <span className="text-red-800 text-sm line-through">{b.content}</span>
            </div>
          );
        }
        if (b.type === "added") {
          return (
            <div key={i} className="flex items-start gap-2 bg-green-50 px-3 py-1.5 border-b border-green-100 last:border-0">
              <span className="text-green-500 font-mono font-bold shrink-0 mt-0.5">+</span>
              <span className="text-green-800 text-sm">{b.content}</span>
            </div>
          );
        }
        return (
          <div key={i} className="flex items-start gap-2 bg-white px-3 py-1.5 border-b border-gray-100 last:border-0">
            <span className="text-gray-300 shrink-0 mt-0.5">•</span>
            <span className="text-gray-600 text-sm">{b.content}</span>
          </div>
        );
      })}
    </div>
  );
}
