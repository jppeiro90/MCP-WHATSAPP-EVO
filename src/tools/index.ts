import type { ToolRegistration } from "../lib/defineTool.js";
import { chatTools } from "./chat.js";
import { extraTools } from "./extras.js";
import { groupTools } from "./groups.js";
import { instanceTools } from "./instances.js";
import { messageTools } from "./messages.js";
import { profileTools } from "./profile.js";
import { settingsTools } from "./settings.js";

export const createTools = (): ToolRegistration[] => [
	...instanceTools,
	...messageTools,
	...chatTools,
	...profileTools,
	...groupTools,
	...settingsTools,
	...extraTools,
];
