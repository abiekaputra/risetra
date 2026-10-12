import { Command } from "commander";
import path from "node:path";

import { exportProposal, loadWorkspace } from "../../core/index.js";
import { success } from "../output.js";

export function registerExportCommand(program: Command): void {
  program
    .command("export")
    .description("Export reviewed proposal chapters to one Markdown document")
    .argument("[directory]", "workspace directory", ".")
    .option("--allow-reviewed", "allow REVIEWED chapters in addition to APPROVED")
    .action(async (directory, options) => {
      const snapshot = await loadWorkspace(path.resolve(directory));
      const target = await exportProposal(snapshot, Boolean(options.allowReviewed));
      success(`Proposal exported to ${target}`);
    });
}
