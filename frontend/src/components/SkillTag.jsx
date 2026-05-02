const toneClasses = {
  success:
    "border-emerald-400/20 bg-emerald-500/10 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]",
  warning:
    "border-amber-400/20 bg-amber-500/10 text-amber-100 shadow-[0_0_0_1px_rgba(245,158,11,0.12)]",
  danger:
    "border-rose-400/20 bg-rose-500/10 text-rose-100 shadow-[0_0_0_1px_rgba(244,63,94,0.12)]",
};

export default function SkillTag({ children, tone = "success" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5 ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
