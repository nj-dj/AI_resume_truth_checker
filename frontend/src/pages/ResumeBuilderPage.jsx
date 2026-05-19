import { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useSubscription } from "../context/SubscriptionContext.jsx";

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
    <div ref={setNodeRef} style={style} className="space-y-4 rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="panel-button-secondary px-3 py-2 text-xs font-semibold"
          {...attributes}
          {...listeners}
        >
          Move
        </button>
        <input
          value={section.title}
          onChange={(e) => onChangeTitle(section.id, e.target.value)}
          className="min-w-[120px] flex-1 panel-input px-4 py-3 text-sm font-semibold outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
        />
      </div>
      <textarea
        value={section.body}
        onChange={(e) => onChangeBody(section.id, e.target.value)}
        rows={5}
        className="w-full panel-input px-4 py-4 text-sm leading-6 text-on-surface outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
      />
    </div>
  );
}

export default function ResumeBuilderPage() {
  const { state: subscription } = useSubscription();
  const saveDrafts = subscription.settings.saveDrafts;
  const [sections, setSections] = useState(() => {
    if (!saveDrafts) return defaultSections();

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
    if (!saveDrafts) {
      window.localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }

    const handle = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    }, 400);
    return () => window.clearTimeout(handle);
  }, [saveDrafts, sections]);

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
    <div className="max-w-container-max mx-auto space-y-10">
      <section className="rounded-[1.5rem] panel-card-soft p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-secondary">Resume Builder</p>
            <h1 className="text-headline-lg font-semibold text-primary">Smart resume builder</h1>
            <p className="mt-4 max-w-3xl text-body-lg text-on-surface-variant">
              Drag sections to reorder, edit inline, {saveDrafts ? "autosave in-browser" : "work in this session"}, and export a clean resume preview.
            </p>
            {!saveDrafts ? (
              <p className="mt-3 border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                Local draft saving is off in Settings. Your edits stay available only until this tab is refreshed.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={addSection} className="panel-button-secondary px-4 py-3 text-sm font-semibold">
              Add section
            </button>
            <button type="button" onClick={exportHtml} className="panel-button-primary px-4 py-3 text-sm font-semibold text-on-secondary transition hover:bg-accent-400">
              Export resume page
            </button>
          </div>
        </div>
      </section>

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
          <p className="text-sm font-semibold text-secondary">Live preview</p>
          <div className="mt-4 min-h-[520px] panel-card-soft p-6">
            {sections.map((s) => (
              <section key={s.id} className="space-y-3">
                <h2 className="text-lg font-semibold text-primary">{s.title}</h2>
                <p className="whitespace-pre-wrap text-sm leading-7 text-on-surface-variant">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
