import { Command } from "commander";
import path from "node:path";

import { loadWorkspace, writeConfig } from "../../core/index.js";
import { success } from "../output.js";

export function registerConfigCommand(program: Command): void {
  program
    .command("config")
    .description("Update independent dashboard, agent, proposal, and source languages")
    .argument("[directory]", "workspace directory", ".")
    .option("--dashboard <locale>", "dashboard locale, for example id-ID")
    .option("--interaction <locale>", "agent interaction locale")
    .option("--proposal <locale>", "proposal output locale")
    .option("--sources <locales>", "comma-separated accepted source locales")
    .option("--citation-locale <locale>", "citation locale")
    .option("--quotation <behavior>", "preserve or translate-with-label", (value) => {
      if (!["preserve", "translate-with-label"].includes(value)) {
        throw new Error("Quotation behavior must be preserve or translate-with-label.");
      }
      return value as "preserve" | "translate-with-label";
    })
    .action(async (directory, options) => {
      const root = path.resolve(directory);
      const snapshot = await loadWorkspace(root);
      const current = snapshot.config.languages;
      snapshot.config.languages = {
        dashboard: (options.dashboard as string | undefined) ?? current.dashboard,
        interaction: (options.interaction as string | undefined) ?? current.interaction,
        proposal: (options.proposal as string | undefined) ?? current.proposal,
        sources: options.sources
          ? (options.sources as string)
              .split(",")
              .map((locale) => locale.trim())
              .filter(Boolean)
          : current.sources,
        citationLocale:
          (options.citationLocale as string | undefined) ?? current.citationLocale,
        quotation: options.quotation ?? current.quotation,
      };
      await writeConfig(root, snapshot.config);
      success(`Language settings updated in ${path.join(root, "risetra.json")}`);
    });
}
