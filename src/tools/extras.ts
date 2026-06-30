import { z } from "zod";
import { getClient } from "../lib/client.js";
import { defineTool } from "../lib/defineTool.js";

const instanceName = z.string().describe("Name of the Evolution API instance");

export const extraTools = [
	// ---- Labels ----
	defineTool({
		name: "find_labels",
		description: "List the chat labels of an instance.",
		schema: z.object({ instanceName }),
		run: (args) =>
			getClient().request("GET", `/label/findLabels/${args.instanceName}`),
	}),

	defineTool({
		name: "handle_label",
		description: "Add or remove a label from a chat.",
		schema: z.object({
			instanceName,
			number: z.string().describe("Chat number/JID"),
			labelId: z.string().describe("Label ID"),
			action: z.enum(["add", "remove"]),
		}),
		run: (args) =>
			getClient().request("POST", `/label/handleLabel/${args.instanceName}`, {
				data: {
					number: args.number,
					labelId: args.labelId,
					action: args.action,
				},
			}),
	}),

	// ---- Templates (WHATSAPP-BUSINESS / Cloud API instances only) ----
	defineTool({
		name: "find_template",
		description:
			"List the message templates of an instance (WHATSAPP-BUSINESS only).",
		schema: z.object({ instanceName }),
		run: (args) =>
			getClient().request("GET", `/template/find/${args.instanceName}`),
	}),

	defineTool({
		name: "create_template",
		description:
			"Create a message template (WHATSAPP-BUSINESS / Cloud API only).",
		schema: z.object({
			instanceName,
			name: z.string().describe("Template name"),
			language: z.string().describe("Language code, e.g. en_US"),
			category: z
				.string()
				.optional()
				.describe("MARKETING, UTILITY or AUTHENTICATION"),
			components: z
				.array(z.record(z.string(), z.unknown()))
				.optional()
				.describe("Template components definition"),
		}),
		run: (args) => {
			const { instanceName: _i, ...data } = args;
			return getClient().request(
				"POST",
				`/template/create/${args.instanceName}`,
				{ data },
			);
		},
	}),

	// ---- Calls ----
	defineTool({
		name: "offer_call",
		description:
			"Offer a (fake) WhatsApp call to a number — rings the recipient without a real call.",
		schema: z.object({
			instanceName,
			number: z.string().describe("Phone number with country code"),
			isVideo: z.boolean().optional().describe("Video call instead of audio"),
			callDuration: z
				.number()
				.optional()
				.describe("Ring duration in seconds"),
		}),
		run: (args) =>
			getClient().request("POST", `/call/offer/${args.instanceName}`, {
				data: {
					number: args.number,
					isVideo: args.isVideo,
					callDuration: args.callDuration,
				},
			}),
	}),
];
