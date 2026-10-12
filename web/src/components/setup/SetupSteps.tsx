import type { ChangeEvent } from "react";

import type { IntakeAttachment, SetupPayload, SourceLead } from "../../types";
import { SetupField, SetupInput, SetupTextarea } from "./SetupField";
import type { SetupCopy } from "./setupCopy";

type StepProps = {
  draft: SetupPayload;
  update: (patch: Partial<SetupPayload>) => void;
  copy: SetupCopy;
};

export function ProfileStep({ draft, update, copy }: StepProps) {
  return (
    <section className="setup-step">
      <header>
        <h2>{copy.profile.title}</h2>
        <p>{copy.profile.description}</p>
      </header>
      <div className="setup-fields">
        <SetupInput
          label={copy.profile.student}
          value={draft.studentName}
          onChange={(studentName) => update({ studentName })}
        />
        <SetupInput
          label={copy.profile.institution}
          value={draft.institution}
          onChange={(institution) => update({ institution })}
        />
        <SetupInput
          label={copy.profile.discipline}
          value={draft.discipline}
          onChange={(discipline) => update({ discipline })}
        />
        <SetupInput
          label={copy.profile.degree}
          value={draft.degreeLevel}
          onChange={(degreeLevel) => update({ degreeLevel })}
        />
        <SetupField label={copy.profile.language} wide>
          <select
            value={draft.language}
            onChange={(event) => update({ language: event.target.value })}
          >
            <option value="id-ID">Bahasa Indonesia</option>
            <option value="en-US">English</option>
          </select>
        </SetupField>
      </div>
    </section>
  );
}

export function ContextStep({ draft, update, copy }: StepProps) {
  const context = draft.context;
  const updateContext = (patch: Partial<SetupPayload["context"]>) =>
    update({ context: { ...context, ...patch } });
  return (
    <section className="setup-step">
      <header>
        <h2>{copy.context.title}</h2>
        <p>{copy.context.description}</p>
      </header>
      <div className="setup-fields">
        <SetupInput
          label={copy.context.project}
          value={draft.projectName}
          onChange={(projectName) => update({ projectName })}
          wide
        />
        <SetupInput
          label={copy.context.topic}
          value={context.topic}
          onChange={(topic) => updateContext({ topic })}
          wide
        />
        <SetupTextarea
          label={copy.context.problem}
          value={context.problem}
          onChange={(problem) => updateContext({ problem })}
        />
        <SetupInput
          label={copy.context.object}
          value={context.researchObject}
          onChange={(researchObject) => updateContext({ researchObject })}
        />
        <SetupInput
          label={copy.context.location}
          value={context.location}
          onChange={(location) => updateContext({ location })}
        />
        <SetupTextarea
          label={copy.context.motivation}
          value={context.motivation}
          onChange={(motivation) => updateContext({ motivation })}
        />
        <SetupInput
          label={copy.context.method}
          value={draft.methodology}
          onChange={(methodology) => update({ methodology })}
          hint="Contoh: belum tahu, kualitatif, kuantitatif, atau pengembangan."
          wide
        />
      </div>
    </section>
  );
}

type MaterialsProps = StepProps & {
  attachments: IntakeAttachment[];
  uploading: boolean;
  onUpload: (files: FileList, category: IntakeAttachment["category"]) => void;
  onRemoveAttachment: (id: string) => void;
};

export function MaterialsStep({
  draft,
  update,
  copy,
  attachments,
  uploading,
  onUpload,
  onRemoveAttachment,
}: MaterialsProps) {
  const updateLead = (index: number, patch: Partial<SourceLead>) => {
    const sourceLeads = draft.sourceLeads.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    );
    update({ sourceLeads });
  };
  const fileHandler =
    (category: IntakeAttachment["category"]) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) onUpload(event.target.files, category);
      event.target.value = "";
    };
  return (
    <section className="setup-step">
      <header>
        <h2>{copy.materials.title}</h2>
        <p>{copy.materials.description}</p>
      </header>
      <div className="upload-grid">
        {(["guideline", "source"] as const).map((category) => (
          <div className="upload-card" key={category}>
            <strong>
              {category === "guideline"
                ? copy.materials.guidelines
                : copy.materials.sourceFiles}
            </strong>
            <label className="button button--secondary upload-button">
              {uploading ? "…" : copy.materials.choose}
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.md,.txt,.csv,.xls,.xlsx"
                onChange={fileHandler(category)}
                disabled={uploading}
              />
            </label>
            <div className="attachment-list">
              {attachments
                .filter((item) => item.category === category)
                .map((item) => (
                  <div className="attachment" key={item.id}>
                    <span>{item.originalName}</span>
                    <button type="button" onClick={() => onRemoveAttachment(item.id)}>
                      {copy.materials.remove}
                    </button>
                  </div>
                ))}
              {!attachments.some((item) => item.category === category) && (
                <small>{copy.materials.empty}</small>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="source-leads">
        {draft.sourceLeads.map((source, index) => (
          <div className="source-lead" key={source.id ?? index}>
            <SetupInput
              label={copy.materials.sourceTitle}
              value={source.title}
              onChange={(title) => updateLead(index, { title })}
            />
            <SetupInput
              label={copy.materials.sourceUrl}
              value={source.url}
              onChange={(url) => updateLead(index, { url })}
              type="url"
            />
            <SetupInput
              label={copy.materials.sourceNote}
              value={source.note}
              onChange={(note) => updateLead(index, { note })}
              required={false}
              wide
            />
            <button
              type="button"
              className="text-button"
              onClick={() =>
                update({
                  sourceLeads: draft.sourceLeads.filter(
                    (_, itemIndex) => itemIndex !== index,
                  ),
                })
              }
            >
              {copy.materials.remove}
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button button--secondary"
          onClick={() =>
            update({
              sourceLeads: [...draft.sourceLeads, { title: "", url: "", note: "" }],
            })
          }
        >
          {copy.materials.addSource}
        </button>
      </div>
    </section>
  );
}

export function ConstraintsStep({ draft, update, copy }: StepProps) {
  const constraints = draft.constraints;
  const updateConstraints = (patch: Partial<SetupPayload["constraints"]>) =>
    update({ constraints: { ...constraints, ...patch } });
  return (
    <section className="setup-step">
      <header>
        <h2>{copy.constraints.title}</h2>
        <p>{copy.constraints.description}</p>
      </header>
      <div className="setup-fields">
        <SetupInput
          label={copy.constraints.timeline}
          value={constraints.timeline}
          onChange={(timeline) => updateConstraints({ timeline })}
        />
        <SetupInput
          label={copy.constraints.budget}
          value={constraints.budget}
          onChange={(budget) => updateConstraints({ budget })}
        />
        <SetupTextarea
          label={copy.constraints.participants}
          value={constraints.participants}
          onChange={(participants) => updateConstraints({ participants })}
          rows={3}
        />
        <SetupTextarea
          label={copy.constraints.data}
          value={constraints.dataAccess}
          onChange={(dataAccess) => updateConstraints({ dataAccess })}
          rows={3}
        />
        <SetupTextarea
          label={copy.constraints.equipment}
          value={constraints.equipment}
          onChange={(equipment) => updateConstraints({ equipment })}
          rows={3}
        />
        <SetupTextarea
          label={copy.constraints.guidance}
          value={draft.supervisorGuidance}
          onChange={(supervisorGuidance) => update({ supervisorGuidance })}
          required={false}
          rows={4}
        />
      </div>
    </section>
  );
}
