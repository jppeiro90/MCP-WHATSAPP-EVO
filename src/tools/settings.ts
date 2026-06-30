import { z } from "zod";
import { getClient } from "../lib/client.js";
import { defineTool } from "../lib/defineTool.js";

const instanceName = z.string().describe("Name of the Evolution API instance");

const webhookEvents = z
	.array(z.string())
	.describe(
		"Events to subscribe to, e.g. MESSAGES_UPSERT, SEND_MESSAGE, CONNECTION_UPDATE, QRCODE_UPDATED",
	);

export const settingsTools = [
	defineTool({
		name: "set_evolution_settings",
		description: "Update the behaviour settings of an instance.",
		schema: z.object({
			instanceName,
			rejectCall: z.boolean().optional(),
			msgCall: z.string().optional().describe("Auto-reply text for rejected calls"),
			groupsIgnore: z.boolean().optional(),
			alwaysOnline: z.boolean().optional(),
			readMessages: z.boolean().optional(),
			readStatus: z.boolean().optional(),
			syncFullHistory: z.boolean().optional(),
		}),
		run: (args) => {
			const { instanceName: _i, ...settings } = args;
			return getClient().request(
				"POST",
				`/settings/set/${args.instanceName}`,
				{ data: settings },
			);
		},
	}),

	defineTool({
		name: "get_evolution_settings",
		description: "Get the current behaviour settings of an instance.",
		schema: z.object({ instanceName }),
		run: (args) =>
			getClient().request("GET", `/settings/find/${args.instanceName}`),
	}),

	defineTool({
		name: "set_evolution_webhook",
		description:
			"Configure the webhook of an instance (where Evolution POSTs events).",
		schema: z.object({
			instanceName,
			enabled: z.boolean(),
			url: z.string().describe("URL that will receive the webhook events"),
			webhookByEvents: z
				.boolean()
				.optional()
				.describe("Append the event name to the URL path"),
			webhookBase64: z
				.boolean()
				.optional()
				.describe("Send media as base64 in the payload"),
			events: webhookEvents.optional(),
		}),
		run: (args) =>
			getClient().request("POST", `/webhook/set/${args.instanceName}`, {
				data: {
					webhook: {
						enabled: args.enabled,
						url: args.url,
						webhookByEvents: args.webhookByEvents,
						webhookBase64: args.webhookBase64,
						events: args.events,
					},
				},
			}),
	}),

	defineTool({
		name: "get_evolution_webhook",
		description: "Get the current webhook configuration of an instance.",
		schema: z.object({ instanceName }),
		run: (args) =>
			getClient().request("GET", `/webhook/find/${args.instanceName}`),
	}),
];
