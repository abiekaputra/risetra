#!/usr/bin/env node

import { Command } from "commander";

import { registerExportCommand } from "./commands/export.js";
import { registerConfigCommand } from "./commands/config.js";
import { registerInitCommand } from "./commands/init.js";
import { registerModulesCommand } from "./commands/modules.js";
import { registerServeCommand } from "./commands/serve.js";
import { registerValidateCommand } from "./commands/validate.js";
import { failure } from "./output.js";

const program = new Command()
  .name("risetra")
  .description("Build research you can defend")
  .version("1.0.0");

registerConfigCommand(program);
registerInitCommand(program);
registerModulesCommand(program);
registerValidateCommand(program);
registerExportCommand(program);
registerServeCommand(program);

try {
  await program.parseAsync();
} catch (error) {
  failure(error instanceof Error ? error.message : "Unexpected CLI failure.");
  process.exitCode = 1;
}
