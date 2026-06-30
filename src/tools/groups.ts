import { z } from "zod";
import { getClient } from "../lib/client.js";
import { defineTool } from "../lib/defineTool.js";

const instanceName = z.string().describe("Name of the Evolution API instance");
const groupJid = z
	.string()
	.describe("Group JID, e.g. 120363012345678901@g.us");

export const groupTools = [
	defineTool({
		name: "fetch_all_groups",
		description: "List all groups the instance belongs to.",
		schema: z.object({
			instanceName,
			getParticipants: z
				.boolean()
				.optional()
				.describe("Include the participant list (default false)"),
		}),
		run: (args) =>
			getClient().request("GET", `/group/fetchAllGroups/${args.instanceName}`, {
				params: { getParticipants: args.getParticipants ?? false },
			}),
	}),

	defineTool({
		name: "find_group_by_jid",
		description: "Get the info of a group by its JID.",
		schema: z.object({ instanceName, groupJid }),
		run: (args) =>
			getClient().request("GET", `/group/findGroupInfos/${args.instanceName}`, {
				params: { groupJid: args.groupJid },
			}),
	}),

	defineTool({
		name: "find_group_members",
		description: "List the participants of a group.",
		schema: z.object({ instanceName, groupJid }),
		run: (args) =>
			getClient().request("GET", `/group/participants/${args.instanceName}`, {
				params: { groupJid: args.groupJid },
			}),
	}),

	defineTool({
		name: "create_group",
		description: "Create a new group with a subject and participants.",
		schema: z.object({
			instanceName,
			subject: z.string().describe("Group name"),
			description: z.string().optional(),
			participants: z
				.array(z.string())
				.describe("Phone numbers with country code to add"),
		}),
		run: (args) =>
			getClient().request("POST", `/group/create/${args.instanceName}`, {
				data: {
					subject: args.subject,
					description: args.description,
					participants: args.participants,
				},
			}),
	}),

	defineTool({
		name: "update_group_subject",
		description: "Change a group's subject (name).",
		schema: z.object({
			instanceName,
			groupJid,
			subject: z.string().describe("New group name"),
		}),
		run: (args) =>
			getClient().request(
				"POST",
				`/group/updateGroupSubject/${args.instanceName}`,
				{ params: { groupJid: args.groupJid }, data: { subject: args.subject } },
			),
	}),

	defineTool({
		name: "update_group_picture",
		description: "Change a group's picture (URL or base64).",
		schema: z.object({
			instanceName,
			groupJid,
			image: z.string().describe("URL or base64 of the new picture"),
		}),
		run: (args) =>
			getClient().request(
				"POST",
				`/group/updateGroupPicture/${args.instanceName}`,
				{ params: { groupJid: args.groupJid }, data: { image: args.image } },
			),
	}),

	defineTool({
		name: "update_group_description",
		description: "Change a group's description.",
		schema: z.object({
			instanceName,
			groupJid,
			description: z.string(),
		}),
		run: (args) =>
			getClient().request(
				"POST",
				`/group/updateGroupDescription/${args.instanceName}`,
				{
					params: { groupJid: args.groupJid },
					data: { description: args.description },
				},
			),
	}),

	defineTool({
		name: "fetch_invite_code",
		description: "Get the invite link/code of a group.",
		schema: z.object({ instanceName, groupJid }),
		run: (args) =>
			getClient().request("GET", `/group/inviteCode/${args.instanceName}`, {
				params: { groupJid: args.groupJid },
			}),
	}),

	defineTool({
		name: "fetch_invite_info",
		description: "Get group info from an invite code (without joining).",
		schema: z.object({
			instanceName,
			inviteCode: z.string().describe("The invite code (not the full URL)"),
		}),
		run: (args) =>
			getClient().request("GET", `/group/inviteInfo/${args.instanceName}`, {
				params: { inviteCode: args.inviteCode },
			}),
	}),

	defineTool({
		name: "accept_invite_code",
		description: "Join a group using an invite code.",
		schema: z.object({
			instanceName,
			inviteCode: z.string().describe("The invite code (not the full URL)"),
		}),
		run: (args) =>
			getClient().request(
				"GET",
				`/group/acceptInviteCode/${args.instanceName}`,
				{ params: { inviteCode: args.inviteCode } },
			),
	}),

	defineTool({
		name: "send_group_invite",
		description: "Send a group invite to one or more numbers.",
		schema: z.object({
			instanceName,
			groupJid,
			description: z.string().describe("Invite message"),
			numbers: z.array(z.string()).describe("Phone numbers with country code"),
		}),
		run: (args) =>
			getClient().request("POST", `/group/sendInvite/${args.instanceName}`, {
				data: {
					groupJid: args.groupJid,
					description: args.description,
					numbers: args.numbers,
				},
			}),
	}),

	defineTool({
		name: "revoke_invite_code",
		description: "Revoke and regenerate a group's invite code.",
		schema: z.object({ instanceName, groupJid }),
		run: (args) =>
			getClient().request(
				"POST",
				`/group/revokeInviteCode/${args.instanceName}`,
				{ params: { groupJid: args.groupJid } },
			),
	}),

	defineTool({
		name: "update_participant",
		description:
			"Add, remove, promote (to admin) or demote participants in a group.",
		schema: z.object({
			instanceName,
			groupJid,
			action: z.enum(["add", "remove", "promote", "demote"]),
			participants: z
				.array(z.string())
				.describe("Phone numbers with country code"),
		}),
		run: (args) =>
			getClient().request(
				"POST",
				`/group/updateParticipant/${args.instanceName}`,
				{
					params: { groupJid: args.groupJid },
					data: { action: args.action, participants: args.participants },
				},
			),
	}),

	defineTool({
		name: "update_group_setting",
		description:
			"Change group settings: who can send messages (announcement) or edit group info (locked).",
		schema: z.object({
			instanceName,
			groupJid,
			action: z.enum([
				"announcement",
				"not_announcement",
				"locked",
				"unlocked",
			]),
		}),
		run: (args) =>
			getClient().request("POST", `/group/updateSetting/${args.instanceName}`, {
				params: { groupJid: args.groupJid },
				data: { action: args.action },
			}),
	}),

	defineTool({
		name: "toggle_ephemeral",
		description:
			"Set disappearing messages for a group (expiration in seconds: 0, 86400, 604800 or 7776000).",
		schema: z.object({
			instanceName,
			groupJid,
			expiration: z
				.number()
				.describe("0 (off), 86400 (24h), 604800 (7d) or 7776000 (90d)"),
		}),
		run: (args) =>
			getClient().request("POST", `/group/toggleEphemeral/${args.instanceName}`, {
				params: { groupJid: args.groupJid },
				data: { expiration: args.expiration },
			}),
	}),

	defineTool({
		name: "leave_group",
		description: "Leave a group.",
		schema: z.object({ instanceName, groupJid }),
		run: (args) =>
			getClient().request("DELETE", `/group/leaveGroup/${args.instanceName}`, {
				params: { groupJid: args.groupJid },
			}),
	}),
];
