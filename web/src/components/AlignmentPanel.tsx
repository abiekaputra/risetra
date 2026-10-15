import type { AlignmentItem } from "../types";

type Props = {
  alignment: AlignmentItem[];
  busy: boolean;
  locale: string;
  onChange: (items: AlignmentItem[]) => void;
  onSave: () => Promise<void>;
};

export function AlignmentPanel({ alignment, busy, locale, onChange, onSave }: Props) {
  const isId = locale.toLowerCase().startsWith("id");
  function update(index: number, patch: Partial<AlignmentItem>) {
    onChange(
      alignment.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    );
  }
  function add() {
    const number = alignment.length + 1;
    onChange([
      ...alignment,
      {
        questionId: `RQ-${number}`,
        question: "",
        objectiveId: `OBJ-${number}`,
        objective: "",
        method: "",
        evidenceOutput: "",
      },
    ]);
  }
  return (
    <section className="data-panel">
      <header className="data-heading">
        <div>
          <span className="eyebrow">{isId ? "Benang merah" : "Research logic"}</span>
          <h2>{isId ? "Keselarasan penelitian" : "Research alignment"}</h2>
        </div>
        <div>
          <button className="button button--secondary" onClick={add}>
            {isId ? "Tambah baris" : "Add row"}
          </button>
          <button className="button button--primary" disabled={busy} onClick={onSave}>
            {isId ? "Simpan" : "Save"}
          </button>
        </div>
      </header>
      <p className="data-intro">
        {isId
          ? "Setiap pertanyaan harus memiliki tujuan, metode yang mampu menjawabnya, dan keluaran bukti yang jelas."
          : "Every question needs an objective, a method capable of answering it, and a clear evidence output."}
      </p>
      <div className="alignment-list">
        {alignment.map((item, index) => (
          <article className="alignment-card" key={`${item.questionId}-${index}`}>
            <div className="source-card__top">
              <strong>
                {item.questionId} ↔ {item.objectiveId}
              </strong>
              <button
                className="text-button"
                onClick={() =>
                  onChange(alignment.filter((_, position) => position !== index))
                }
              >
                {isId ? "Hapus" : "Remove"}
              </button>
            </div>
            <div className="field-row">
              <label>
                ID pertanyaan
                <input
                  value={item.questionId}
                  onChange={(e) => update(index, { questionId: e.target.value })}
                />
              </label>
              <label>
                ID tujuan
                <input
                  value={item.objectiveId}
                  onChange={(e) => update(index, { objectiveId: e.target.value })}
                />
              </label>
            </div>
            <label>
              {isId ? "Pertanyaan penelitian" : "Research question"}
              <textarea
                rows={2}
                value={item.question}
                onChange={(e) => update(index, { question: e.target.value })}
              />
            </label>
            <label>
              {isId ? "Tujuan penelitian" : "Research objective"}
              <textarea
                rows={2}
                value={item.objective}
                onChange={(e) => update(index, { objective: e.target.value })}
              />
            </label>
            <div className="field-row">
              <label>
                {isId ? "Metode" : "Method"}
                <input
                  value={item.method}
                  onChange={(e) => update(index, { method: e.target.value })}
                />
              </label>
              <label>
                {isId ? "Bukti yang dihasilkan" : "Evidence output"}
                <input
                  value={item.evidenceOutput}
                  onChange={(e) => update(index, { evidenceOutput: e.target.value })}
                />
              </label>
            </div>
          </article>
        ))}
        {alignment.length === 0 && (
          <div className="blank-panel">
            {isId
              ? "Keselarasan belum ditentukan. Codex akan membantu menyusunnya."
              : "Alignment is not defined yet. Codex will help build it."}
          </div>
        )}
      </div>
    </section>
  );
}
