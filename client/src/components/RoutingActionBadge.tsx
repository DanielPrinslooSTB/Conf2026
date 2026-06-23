interface RoutingActionBadgeProps {
  action: string;
}

const actionStyles: Record<string, string> = {
  Escalate: "bg-red-800 text-white",
  "Investigate Further": "bg-amber-800 text-white",
  "Resolve Immediately": "bg-green-800 text-white",
  "Refer to Another Team": "bg-blue-800 text-white",
};

export function RoutingActionBadge({ action }: RoutingActionBadgeProps) {
  const style = actionStyles[action] || "bg-gray-600 text-white";

  return (
    <span
      className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold ${style}`}
      aria-label={`Routing action: ${action}`}
    >
      {action}
    </span>
  );
}
