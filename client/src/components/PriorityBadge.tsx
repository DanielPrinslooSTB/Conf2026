interface PriorityBadgeProps {
  level: string;
}

const priorityStyles: Record<string, string> = {
  High: "bg-red-600 text-white",
  Medium: "bg-amber-600 text-white",
  Low: "bg-green-600 text-white",
};

export function PriorityBadge({ level }: PriorityBadgeProps) {
  const style = priorityStyles[level] || "bg-gray-400 text-white";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style}`}
      aria-label={`Priority: ${level}`}
    >
      {level}
    </span>
  );
}
