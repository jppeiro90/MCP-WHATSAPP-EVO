import { z } from "zod";
import { getClient } from "../lib/client.js";
import { defineTool } from "../lib/defineTool.js";

const instanceName = z
	.string()
	.describe("Name of the Evolution API instance");

export const instanceTools = [
	defineTool({
		name: "fetch_evolution_instances",
		description:
			"List all WhatsApp instances (or a specific one by name) with their connection status, owner and counts.",
		schema: z.object({
			instanceName: z
				.string()
				.optional()
				.describe("Optional. Name of a specific instance to fetch"),
		}),
		run: (args) =>
			getClient().request("GET", "/instance/fetchInstances", {
				params: args.instanceName
					? { instanceName: args.instanceName }
					: undefined,
			}),
	}),

	defineTool({
		name: "get_connection_state",
		description:
			"Check the connection state of a WhatsApp instance (open = connected, close/connecting otherwise).",
		schema: z.object({ instanceName }),
		run: (args) =>
			getClient().request(
				"GET",
				`/instance/connectionState/${args.instanceName}`,
			),
	}),

	defineTool({
		name: "create_evolution_instance",
		description:
			"Create a new WhatsApp instance. Returns the instance hash/apikey and (for Baileys) a QR code to connect.",
		schema: z.object({
			instanceName: z.string().describe("Unique name for the new instance"),
			number: z
				.string()
				.optional()
				.describe("Phone number with country code (no +)"),
			qrcode: z
				.boolean()
				.optional()
				.describe("Return a QR code to connect (default true)"),
			integration: z
				.enum(["WHATSAPP-BAILEYS", "WHATSAPP-BUSINESS"])
				.optional()
				.describe("Integration type (default WHATSAPP-BAILEYS)"),
			rejectCall: z.boolean().optional(),
			msgCall: z.string().optional(),
			groupsIgnore: z.boolean().optional(),
			alwaysOnline: z.boolean().optional(),
			readMessages: z.boolean().optional(),
			readStatus: z.boolean().optional(),
			syncFullHistory: z.boolean().optional(),
		}),
		run: (args) =>
			getClient().request("POST", "/instance/create", { data: args }),
	}),

	defineTool({
		name: "connect_evolution_instance",
		description:
			"Connect a WhatsApp instance and get the pairing code / QR code base64.",
		schema: z.object({
			instanceName,
			number: z
				.string()
				.optional()
				.describe("Optional phone number to request a pairing code"),
		}),
		run: (args) =>
			getClient().request("GET", `/instance/connect/${args.instanceName}`, {
				params: args.number ? { number: args.number } : undefined,
			}),
	}),

	defineTool({
		name: "restart_evolution_instance",
		description: "Restart a WhatsApp instance.",
		schema: z.object({ instanceName }),
		run: (args) =>
			getClient().request("POST", `/instance/restart/${args.instanceName}`),
	}),

	defineTool({
		name: "set_evolution_presence",
		description:
			"Set the global presence of an instance (available or unavailable).",
		schema: z.object({
			instanceName,
			presence: z
				.enum(["available", "unavailable"])
				.describe("Presence status"),
		}),
		run: (args) =>
			getClient().request("POST", `/instance/setPresence/${args.instanceName}`, {
				data: { presence: args.presence },
			}),
	}),

	defineTool({
		name: "logout_evolution_instance",
		description:
			"Log out a WhatsApp instance (disconnects the device without deleting the instance).",
		schema: z.object({ instanceName }),
		run: (args) =>
			getClient().request("DELETE", `/instance/logout/${args.instanceName}`),
	}),

	defineTool({
		name: "delete_evolution_instance",
		description: "Permanently delete a WhatsApp instance.",
		schema: z.object({ instanceName }),
		run: (args) =>
			getClient().request("DELETE", `/instance/delete/${args.instanceName}`),
	}),

	defineTool({
		name: "get_evolution_info",
		description: "Get basic information about the Evolution API server (version, status).",
		schema: z.object({}),
		run: () => getClient().request("GET", "/"),
	}),
];
