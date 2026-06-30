import { z } from "zod";
import { getClient } from "../lib/client.js";
import { defineTool } from "../lib/defineTool.js";

const instanceName = z.string().describe("Name of the Evolution API instance");
const number = z.string().describe("Phone number with country code");

export const profileTools = [
	defineTool({
		name: "fetch_business_profile",
		description: "Fetch the WhatsApp Business profile of a number.",
		schema: z.object({ instanceName, number }),
		run: (args) =>
			getClient().request(
				"POST",
				`/chat/fetchBusinessProfile/${args.instanceName}`,
				{ data: { number: args.number } },
			),
	}),

	defineTool({
		name: "fetch_profile",
		description: "Fetch the profile (name, status, picture) of a number.",
		schema: z.object({ instanceName, number }),
		run: (args) =>
			getClient().request("POST", `/chat/fetchProfile/${args.instanceName}`, {
				data: { number: args.number },
			}),
	}),

	defineTool({
		name: "update_profile_name",
		description: "Update the display name of the instance's own profile.",
		schema: z.object({
			instanceName,
			name: z.string().describe("New profile name"),
		}),
		run: (args) =>
			getClient().request(
				"POST",
				`/chat/updateProfileName/${args.instanceName}`,
				{ data: { name: args.name } },
			),
	}),

	defineTool({
		name: "update_profile_status",
		description: "Update the 'about'/status text of the instance's own profile.",
		schema: z.object({
			instanceName,
			status: z.string().describe("New status/about text"),
		}),
		run: (args) =>
			getClient().request(
				"POST",
				`/chat/updateProfileStatus/${args.instanceName}`,
				{ data: { status: args.status } },
			),
	}),

	defineTool({
		name: "update_profile_picture",
		description: "Update the profile picture of the instance (URL or base64).",
		schema: z.object({
			instanceName,
			picture: z.string().describe("URL or base64 of the new picture"),
		}),
		run: (args) =>
			getClient().request(
				"POST",
				`/chat/updateProfilePicture/${args.instanceName}`,
				{ data: { picture: args.picture } },
			),
	}),

	defineTool({
		name: "remove_profile_picture",
		description: "Remove the profile picture of the instance.",
		schema: z.object({ instanceName }),
		run: (args) =>
			getClient().request(
				"DELETE",
				`/chat/removeProfilePicture/${args.instanceName}`,
			),
	}),

	defineTool({
		name: "fetch_privacy_settings",
		description: "Fetch the privacy settings of the instance.",
		schema: z.object({ instanceName }),
		run: (args) =>
			getClient().request(
				"GET",
				`/chat/fetchPrivacySettings/${args.instanceName}`,
			),
	}),

	defineTool({
		name: "update_privacy_settings",
		description:
			"Update the privacy settings of the instance (read receipts, profile, status, online, last seen, group add).",
		schema: z.object({
			instanceName,
			readreceipts: z.enum(["all", "none"]).optional(),
			profile: z
				.enum(["all", "contacts", "contact_blacklist", "none"])
				.optional(),
			status: z
				.enum(["all", "contacts", "contact_blacklist", "none"])
				.optional(),
			online: z.enum(["all", "match_last_seen"]).optional(),
			last: z.enum(["all", "contacts", "contact_blacklist", "none"]).optional(),
			groupadd: z
				.enum(["all", "contacts", "contact_blacklist", "none"])
				.optional(),
		}),
		run: (args) => {
			const { instanceName: _i, ...settings } = args;
			return getClient().request(
				"POST",
				`/chat/updatePrivacySettings/${args.instanceName}`,
				{ data: settings },
			);
		},
	}),
];
