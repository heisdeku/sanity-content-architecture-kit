import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./sanity/config/env";

export default defineCliConfig({
  api: { projectId, dataset },
  // Typegen settings live in sanity-typegen.json.
  autoUpdates: false,
});
