import { z } from "zod";

import type { LiteratureCandidate, SourceRecord } from "./types.js";

type Fetcher = typeof fetch;

const crossrefResponseSchema = z.object({
  message: z.object({
    items: z.array(
      z.object({
        DOI: z.string().optional(),
        URL: z.url().optional(),
        title: z.array(z.string()).optional(),
        author: z
          .array(
            z.object({
              given: z.string().optional(),
              family: z.string().optional(),
              name: z.string().optional(),
            }),
          )
          .optional(),
        published: z.object({ "date-parts": z.array(z.array(z.number())) }).optional(),
        issued: z.object({ "date-parts": z.array(z.array(z.number())) }).optional(),
        type: z.string().optional(),
      }),
    ),
  }),
});

export async function searchLiterature(
  query: string,
  yearFrom?: number,
  fetcher: Fetcher = fetch,
): Promise<LiteratureCandidate[]> {
  const normalized = query.trim();
  if (normalized.length < 3) throw new Error("Search query is too short.");

  const url = new URL("https://api.crossref.org/v1/works");
  url.searchParams.set("query.bibliographic", normalized);
  url.searchParams.set("rows", "8");
  url.searchParams.set("select", "DOI,title,author,published,issued,URL,type");
  if (yearFrom) url.searchParams.set("filter", `from-pub-date:${yearFrom}-01-01`);

  const response = await fetcher(url, {
    headers: { "User-Agent": "Risetra/1.0 (mailto:risetra@local.invalid)" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error("Crossref search is temporarily unavailable.");

  const parsed = crossrefResponseSchema.parse(await response.json());
  return parsed.message.items.flatMap((item) => {
    const title = item.title?.[0]?.trim();
    const year =
      item.published?.["date-parts"]?.[0]?.[0] ?? item.issued?.["date-parts"]?.[0]?.[0];
    if (!title || !year) return [];
    return [
      {
        provider: "Crossref" as const,
        title,
        authors: formatAuthors(item.author),
        year,
        type: mapSourceType(item.type),
        doi: item.DOI,
        url: item.URL,
      },
    ];
  });
}

export function candidateToSource(
  candidate: LiteratureCandidate,
  id: string,
): SourceRecord {
  return {
    id,
    title: candidate.title,
    authors: candidate.authors.length > 0 ? candidate.authors : ["Unknown author"],
    year: candidate.year,
    type: candidate.type,
    doi: candidate.doi,
    url: candidate.url,
    verified: false,
    note: "Candidate metadata from Crossref; verify the full text and relevance before citation.",
  };
}

function formatAuthors(
  authors?: Array<{ given?: string; family?: string; name?: string }>,
): string[] {
  return (authors ?? [])
    .map(
      (author) =>
        author.name ?? [author.given, author.family].filter(Boolean).join(" "),
    )
    .filter((author) => author.length > 0);
}

function mapSourceType(type?: string): SourceRecord["type"] {
  if (type === "journal-article" || type === "proceedings-article") return "journal";
  if (type === "book" || type === "book-chapter" || type === "monograph") {
    return "book";
  }
  if (type === "dataset") return "dataset";
  return "report";
}
