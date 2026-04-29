interface Props {
  label: string;
  variant?: "gray" | "green" | "blue" | "yellow" | "red" | "indigo";
}

const styles: Record<NonNullable<Props["variant"]>, string> = {
  gray: "bg-gray-100 text-gray-700",
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  indigo: "bg-indigo-100 text-indigo-800",
};

export default function Badge({ label, variant = "gray" }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  );
}

export function statusVariant(status: string): Props["variant"] {
  const map: Record<string, Props["variant"]> = {
    applied: "blue",
    interviewing: "yellow",
    offered: "green",
    rejected: "red",
    withdrawn: "gray",
    draft: "gray",
    reviewed: "indigo",
    exported: "green",
  };
  return map[status] ?? "gray";
}
