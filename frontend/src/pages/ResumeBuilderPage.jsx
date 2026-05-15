import { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STORAGE_KEY = "enhancemyaicv-resume-builder-v1";

const defaultSections = () => [
  { id: "sec-profile", title: "Profile", body: "Principal engineer focused on resilient delivery platforms." },
  { id: "sec-impact", title: "Selected impact", body: "- Scaled API tier to 8M daily requests\n- Cut infra spend by 22% via autoscaling policies" },
  { id: "sec-skills", title: "Core skills", body: "TypeScript · React · Node.js · PostgreSQL · AWS" },
];

function SortableSection({ section, onChangeTitle, onChangeBody }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-semibold text-[var(--muted)]"
          {...attributes}
          {...listeners}
        >
          Drag
        </button>
        <input
          value={section.title}
          onChange={(e) => onChangeTitle(section.id, e.target.value)}
          className="min-w-[120px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <textarea
        value={section.body}
        onChange={(e) => onChangeBody(section.id, e.target.value)}
        rows={5}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm leading-6 outline-none ring-[var(--accent)] focus:ring-2"
      />
    </div>
  );
}

export default function ResumeBuilderPage() {
  const [sections, setSections] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSections();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : defaultSections();
    } catch {
      return defaultSections();
    }
  });

  useEffect(() => {
    const handle = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    }, 400);
    return () => window.clearTimeout(handle);
  }, [sections]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const previewHtml = useMemo(() => {
    const escape = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    return sections
      .map(
        (s) =>
          `<section style="margin-bottom:1.5rem"><h2 style="margin:0 0 0.5rem;font-size:1.1rem">${escape(s.title)}</h2><p style="margin:0;white-space:pre-wrap;line-height:1.6">${escape(s.body)}</p></section>`,
      )
      .join("");
  }, [sections]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const changeTitle = (id, title) => {
    setSections((items) => items.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  const changeBody = (id, body) => {
    setSections((items) => items.map((s) => (s.id === id ? { ...s, body } : s)));
  };

  const addSection = () => {
    setSections((items) => [...items, { id: `sec-${crypto.randomUUID()}`, title: "New section", body: "" }]);
  };

  const exportHtml = () => {
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Resume preview</title>
    <style>body{font-family:system-ui;margin:40px;color:#0f172a;background:#f8fafc}</style></head><body>${previewHtml}</body></html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-preview.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Smart resume builder</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Drag sections to reorder, edit inline, autosave to your browser, and export a print-friendly HTML preview. PDF
            export uses your browser print dialog for pixel-perfect output.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={addSection} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">
            Add section
          </button>
          <button type="button" onClick={exportHtml} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950">
            Export HTML
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {sections.map((section) => (
                <SortableSection key={section.id} section={section} onChangeTitle={changeTitle} onChangeBody={changeBody} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div>
          <p className="text-sm font-semibold text-[var(--muted)]">Live preview</p>
          <div className="mt-3 min-h-[520px] space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-inner">
            {sections.map((s) => (
              <section key={s.id}>
                <h2 className="text-lg font-semibold text-[var(--text)]">{s.title}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
