import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type ActivityEvent = {
  action: string;
  artifactId?: string;
  detail?: string;
  occurredAt: string;
};

export async function recordActivity(
  root: string,
  event: Omit<ActivityEvent, "occurredAt">,
): Promise<void> {
  const target = path.join(root, "records", "activity.ndjson");
  await mkdir(path.dirname(target), { recursive: true });
  const entry: ActivityEvent = {
    ...event,
    occurredAt: new Date().toISOString(),
  };
  await appendFile(target, `${JSON.stringify(entry)}\n`, "utf8");
}
