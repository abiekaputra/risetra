import { describe, expect, it, vi } from "vitest";

import { candidateToSource, searchLiterature } from "../src/core/literature.js";

describe("literature search", () => {
  it("normalizes Crossref metadata into unverified source candidates", async () => {
    const requested: URL[] = [];
    const fetcher: typeof fetch = async (input) => {
      requested.push(input as URL);
      return new Response(
        JSON.stringify({
          message: {
            items: [
              {
                DOI: "10.1000/example",
                URL: "https://doi.org/10.1000/example",
                title: ["A useful study"],
                author: [{ given: "Ayu", family: "Putri" }],
                published: { "date-parts": [[2024]] },
                type: "journal-article",
              },
            ],
          },
        }),
        { status: 200 },
      );
    };

    const candidates = await searchLiterature("research literacy", 2020, fetcher);
    expect(candidates).toEqual([
      expect.objectContaining({
        title: "A useful study",
        authors: ["Ayu Putri"],
        year: 2024,
        type: "journal",
      }),
    ]);
    expect(String(requested[0])).toContain("from-pub-date%3A2020");

    const source = candidateToSource(candidates[0]!, "SRC-TEST");
    expect(source.verified).toBe(false);
    expect(source.note).toContain("verify");
  });

  it("rejects short queries and remote failures", async () => {
    await expect(searchLiterature("ai")).rejects.toThrow("too short");
    await expect(
      searchLiterature(
        "valid query",
        undefined,
        vi.fn(async () => new Response("unavailable", { status: 503 })),
      ),
    ).rejects.toThrow("temporarily unavailable");
  });
});
