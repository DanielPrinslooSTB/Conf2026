import { useState, useRef, useEffect } from "react";

interface DateRangeFilterProps {
  label: string;
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export function DateRangeFilter({
  label,
  from,
  to,
  onChange,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasValue = from !== "" || to !== "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
          hasValue
            ? "border-brand-blue-600 bg-brand-blue-50 text-brand-blue-800"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
        aria-expanded={open}
      >
        {label}
        {hasValue && (
          <span className="ml-1 bg-brand-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            ✓
          </span>
        )}
        <svg
          className={`w-3 h-3 ml-1 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="space-y-2">
            <div>
              <label htmlFor="date-from" className="block text-xs font-medium text-gray-600 mb-1">
                From
              </label>
              <input
                id="date-from"
                type="date"
                value={from}
                onChange={(e) => onChange(e.target.value, to)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-600"
              />
            </div>
            <div>
              <label htmlFor="date-to" className="block text-xs font-medium text-gray-600 mb-1">
                To
              </label>
              <input
                id="date-to"
                type="date"
                value={to}
                onChange={(e) => onChange(from, e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-600"
              />
            </div>
          </div>
          {hasValue && (
            <button
              type="button"
              onClick={() => onChange("", "")}
              className="mt-2 w-full text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Clear dates
            </button>
          )}
        </div>
      )}
    </div>
  );
}
