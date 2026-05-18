const toneClasses = {
  success:
    "border-emerald-600/25 bg-emerald-50 text-emerald-800 shadow-[0_0_0_1px_rgba(16,185,129,0.08)] dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:shadow-[0_0_0_1px_rgba(16,185,129,0.12)]",
  warning:
    "border-amber-600/25 bg-amber-50 text-amber-800 shadow-[0_0_0_1px_rgba(245,158,11,0.08)] dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100 dark:shadow-[0_0_0_1px_rgba(245,158,11,0.12)]",
  danger:
    "border-rose-600/25 bg-rose-50 text-rose-800 shadow-[0_0_0_1px_rgba(244,63,94,0.08)] dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-100 dark:shadow-[0_0_0_1px_rgba(244,63,94,0.12)]",
};

export default function SkillTag({ children, tone = "success" }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-3 py-1 text-sm font-medium transition-colors duration-150 ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
