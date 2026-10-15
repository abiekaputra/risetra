import type { WorkspaceTab } from "../types";

type Props = {
  active: WorkspaceTab;
  locale: string;
  onChange: (tab: WorkspaceTab) => void;
};

const tabs: { id: WorkspaceTab; idLabel: string; enLabel: string }[] = [
  { id: "guidance", idLabel: "Bimbingan", enLabel: "Guidance" },
  { id: "documents", idLabel: "Dokumen", enLabel: "Documents" },
  { id: "sources", idLabel: "Sumber", enLabel: "Sources" },
  { id: "alignment", idLabel: "Keselarasan", enLabel: "Alignment" },
  { id: "checks", idLabel: "Validasi & ekspor", enLabel: "Checks & export" },
];

export function ResearchNav({ active, locale, onChange }: Props) {
  const indonesian = locale.toLowerCase().startsWith("id");
  return (
    <nav className="research-nav" aria-label="Research workspace">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={active === tab.id ? "is-active" : undefined}
          onClick={() => onChange(tab.id)}
        >
          {indonesian ? tab.idLabel : tab.enLabel}
        </button>
      ))}
    </nav>
  );
}
