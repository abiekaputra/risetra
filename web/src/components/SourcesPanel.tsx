import { useState } from "react";

import { searchLiterature } from "../api";
import { createSourceId } from "../source-id";
import type { LiteratureCandidate, SourceRecord } from "../types";

type Props = {
  sources: SourceRecord[];
  busy: boolean;
  locale: string;
  onChange: (sources: SourceRecord[]) => void;
  onSave: () => Promise<void>;
};

export function SourcesPanel({ sources, busy, locale, onChange, onSave }: Props) {
  const isId = locale.toLowerCase().startsWith("id");
  const [query, setQuery] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [results, setResults] = useState<LiteratureCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>();
  function update(index: number, patch: Partial<SourceRecord>) {
    onChange(
      sources.map((source, position) =>
        position === index ? { ...source, ...patch } : source,
      ),
    );
  }
  function add() {
    onChange([
      ...sources,
      {
        id: createSourceId(),
        title: "",
        authors: [""],
        year: new Date().getFullYear(),
        type: "journal",
        verified: false,
        note: "",
      },
    ]);
  }
  function addCandidate(candidate: LiteratureCandidate) {
    onChange([
      ...sources,
      {
        ...candidate,
        id: createSourceId(),
        verified: false,
        note: isId
          ? "Metadata kandidat dari Crossref; periksa teks lengkap dan relevansinya sebelum dikutip."
          : "Candidate metadata from Crossref; verify the full text and relevance before citation.",
      },
    ]);
    setResults((items) => items.filter((item) => item !== candidate));
  }
  async function runSearch() {
    setSearching(true);
    setSearchError(undefined);
    try {
      setResults(
        await searchLiterature(
          query,
          yearFrom.length > 0 ? Number(yearFrom) : undefined,
        ),
      );
    } catch (caught) {
      setSearchError(
        caught instanceof Error ? caught.message : "Literature search failed.",
      );
    } finally {
      setSearching(false);
    }
  }
  return (
    <section className="data-panel">
      <header className="data-heading">
        <div>
          <span className="eyebrow">{isId ? "Jejak bukti" : "Evidence trail"}</span>
          <h2>{isId ? "Inventaris sumber" : "Source inventory"}</h2>
        </div>
        <div>
          <button className="button button--secondary" onClick={add}>
            {isId ? "Tambah sumber" : "Add source"}
          </button>
          <button className="button button--primary" disabled={busy} onClick={onSave}>
            {isId ? "Simpan" : "Save"}
          </button>
        </div>
      </header>
      <p className="data-intro">
        {isId
          ? "Terverifikasi berarti metadata dan akses sumber sudah Anda periksa sendiri. Status ini bukan penilaian otomatis dari AI."
          : "Verified means you personally checked the metadata and source access. It is not an automatic AI judgment."}
      </p>
      <div className="literature-search">
        <div>
          <strong>
            {isId ? "Cari kandidat literatur" : "Find literature candidates"}
          </strong>
          <small>
            {isId
              ? "Kata kunci dikirim ke Crossref. Hasil hanyalah metadata kandidat, bukan bukti yang sudah diverifikasi."
              : "Keywords are sent to Crossref. Results are candidate metadata, not verified evidence."}
          </small>
        </div>
        <div className="literature-search__form">
          <input
            value={query}
            minLength={3}
            placeholder={
              isId ? "Topik, konsep, atau judul" : "Topic, concept, or title"
            }
            onChange={(event) => setQuery(event.target.value)}
          />
          <input
            className="year-input"
            type="number"
            min="1500"
            max="2100"
            placeholder={isId ? "Sejak tahun" : "From year"}
            value={yearFrom}
            onChange={(event) => setYearFrom(event.target.value)}
          />
          <button
            className="button button--secondary"
            disabled={searching || query.trim().length < 3}
            onClick={runSearch}
          >
            {searching ? (isId ? "Mencari…" : "Searching…") : isId ? "Cari" : "Search"}
          </button>
        </div>
        {searchError && <p className="inline-error">{searchError}</p>}
        {results.length > 0 && (
          <div className="literature-results">
            {results.map((result) => (
              <article key={`${result.doi ?? result.url}-${result.title}`}>
                <div>
                  <strong>{result.title}</strong>
                  <small>
                    {result.authors.join(", ") ||
                      (isId ? "Penulis tidak tersedia" : "No author listed")}{" "}
                    · {result.year}
                  </small>
                </div>
                <button className="text-button" onClick={() => addCandidate(result)}>
                  {isId ? "Tambahkan" : "Add"}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="source-cards">
        {sources.map((source, index) => (
          <article className="source-card" key={source.id}>
            <div className="source-card__top">
              <strong>{source.id}</strong>
              <button
                className="text-button"
                onClick={() =>
                  onChange(sources.filter((_, position) => position !== index))
                }
              >
                {isId ? "Hapus" : "Remove"}
              </button>
            </div>
            <label>
              {isId ? "Judul" : "Title"}
              <input
                value={source.title}
                onChange={(e) => update(index, { title: e.target.value })}
              />
            </label>
            <label>
              {isId ? "Penulis, pisahkan dengan koma" : "Authors, comma separated"}
              <input
                value={source.authors.join(", ")}
                onChange={(e) =>
                  update(index, {
                    authors: e.target.value.split(",").map((value) => value.trim()),
                  })
                }
              />
            </label>
            <div className="field-row">
              <label>
                {isId ? "Tahun" : "Year"}
                <input
                  type="number"
                  value={source.year}
                  onChange={(e) => update(index, { year: Number(e.target.value) })}
                />
              </label>
              <label>
                {isId ? "Jenis" : "Type"}
                <select
                  value={source.type}
                  onChange={(e) =>
                    update(index, { type: e.target.value as SourceRecord["type"] })
                  }
                >
                  {source.type === "demo" && <option value="demo">Demo</option>}
                  <option value="journal">Journal</option>
                  <option value="book">Book</option>
                  <option value="report">Report</option>
                  <option value="dataset">Dataset</option>
                </select>
              </label>
            </div>
            <label>
              DOI
              <input
                value={source.doi ?? ""}
                onChange={(e) => update(index, { doi: e.target.value || undefined })}
              />
            </label>
            <label>
              URL
              <input
                type="url"
                value={source.url ?? ""}
                onChange={(e) => update(index, { url: e.target.value || undefined })}
              />
            </label>
            <label>
              {isId ? "Catatan bukti" : "Evidence note"}
              <textarea
                rows={3}
                value={source.note ?? ""}
                onChange={(e) => update(index, { note: e.target.value })}
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={source.verified}
                onChange={(e) => update(index, { verified: e.target.checked })}
              />
              {isId ? "Saya sudah memverifikasi sumber ini" : "I verified this source"}
            </label>
          </article>
        ))}
        {sources.length === 0 && (
          <div className="blank-panel">
            {isId ? "Belum ada sumber terdaftar." : "No registered sources yet."}
          </div>
        )}
      </div>
    </section>
  );
}
