import { Command } from "commander";

import { initializeWorkspace } from "../../core/index.js";
import { success } from "../output.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Create a traceable research proposal workspace")
    .argument("[directory]", "workspace directory", ".")
    .option("--name <name>", "proposal or working project name", "My research proposal")
    .option("--student <name>", "student name", "Student")
    .option("--institution <name>", "institution name", "Institution")
    .option("--discipline <name>", "discipline or study program", "General")
    .option("--method <name>", "initial methodology selection", "Undecided")
    .option("--language <code>", "proposal language", "id-ID")
    .action(async (directory, options) => {
      const target = await initializeWorkspace({
        target: directory,
        projectName: options.name as string,
        studentName: options.student as string,
        institution: options.institution as string,
        discipline: options.discipline as string,
        methodology: options.method as string,
        proposalLanguage: options.language as string,
      });
      success(`Workspace created at ${target}`);
      console.log(`Next: risetra serve ${directory}`);
    });
}
