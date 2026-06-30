import { z } from "zod";
import { getClient } from "../lib/client.js";
import { defineTool } from "../lib/defineTool.js";

const instanceName = z.string().describe("Name of the Evolution API instance");
const number = z.string().describe("Phone number with country code");

export const chatTools = [
	defineTool({
		name: "find_messages",
		description:
			"Read the message history of a chat. Filter by the contact's remoteJid (e.g. 5491112345678@s.whatsapp.net or a group ...@g.us). Results are paginated.",
		schema: z.object({
			instanceName,
			remoteJid: z
				.string()
				.describe(
					"Chat JID to read, e.g. 5491112345678@s.whatsapp.net or 12036...@g.us",
				),
			page: z.number().optional().describe("Page number (default 1)"),
			offset: z
				.number()
				.optional()
				.describe("Messages per page (default 10, max ~100)"),
		}),
		run: (args) =>
			getClient().request("POST", `/chat/findMessages/${args.instanceName}`, {
				data: {
					where: { key: { remoteJid: args.remoteJid } },
					page: args.page,
					offset: args.offset,
				},
			}),
	}),

	defineTool({
		name: "find_chats",
		description:
			"List WhatsApp chats with their metadata (name, last message timestamp, unread count).",
		schema: z.object({
			instanceName,
			where: z
				.object({
					id: z.string().optional().describe("Filter by chat ID/phone"),
					name: z.string().optional(),
					archived: z.boolean().optional(),
				})
				.optional(),
		}),
		run: (args) =>
			getClient().request("POST", `/chat/findChats/${args.instanceName}`, {
				data: { where: args.where ?? {} },
			}),
	}),

	defineTool({
		name: "find_contacts",
		description: "Search contacts by id (phone/JID) or name.",
		schema: z.object({
			instanceName,
			where: z
				.object({
					id: z.string().optional(),
					name: z.string().optional(),
				})
				.optional(),
		}),
		run: (args) =>
			getClient().request("POST", `/chat/findContacts/${args.instanceName}`, {
				data: { where: args.where ?? {} },
			}),
	}),

	defineTool({
		name: "find_chat_by_remote_jid",
		description: "Find a single chat by its remoteJid.",
		schema: z.object({
			instanceName,
			remoteJid: z.string().describe("Chat JID to look up"),
		}),
		run: (args) =>
			getClient().request(
				"GET",
				`/chat/findChatByRemoteJid/${args.instanceName}`,
				{ params: { remoteJid: args.remoteJid } },
			),
	}),

	defineTool({
		name: "find_status_message",
		description: "Retrieve status (story) messages.",
		schema: z.object({
			instanceName,
			where: z.record(z.string(), z.unknown()).optional(),
		}),
		run: (args) =>
			getClient().request(
				"POST",
				`/chat/findStatusMessage/${args.instanceName}`,
				{ data: { where: args.where ?? {} } },
			),
	}),

	defineTool({
		name: "check_whatsapp_numbers",
		description:
			"Check whether one or more phone numbers are registered on WhatsApp.",
		schema: z.object({
			instanceName,
			numbers: z
				.array(z.string())
				.describe("Phone numbers with country code to check"),
		}),
		run: (args) =>
			getClient().request("POST", `/chat/whatsappNumbers/${args.instanceName}`, {
				data: { numbers: args.numbers },
			}),
	}),

	defineTool({
		name: "mark_message_as_read",
		description: "Mark one or more messages as read.",
		schema: z.object({
			instanceName,
			readMessages: z.array(
				z.object({
					remoteJid: z.string(),
					fromMe: z.boolean(),
					id: z.string(),
				}),
			),
		}),
		run: (args) =>
			getClient().request(
				"POST",
				`/chat/markMessageAsRead/${args.instanceName}`,
				{ data: { readMessages: args.readMessages } },
			),
	}),

	defineTool({
		name: "mark_chat_unread",
		description: "Mark a chat as unread.",
		schema: z.object({
			instanceName,
			chat: z.string().describe("Chat remoteJid"),
			lastMessage: z
				.record(z.string(), z.unknown())
				.optional()
				.describe("Last message object { key: {...} }"),
		}),
		run: (args) =>
			getClient().request("POST", `/chat/markChatUnread/${args.instanceName}`, {
				data: { chat: args.chat, lastMessage: args.lastMessage },
			}),
	}),

	defineTool({
		name: "archive_chat",
		description: "Archive or unarchive a chat.",
		schema: z.object({
			instanceName,
			chat: z.string().describe("Chat remoteJid"),
			archive: z.boolean().describe("true to archive, false to unarchive"),
			lastMessage: z
				.record(z.string(), z.unknown())
				.optional()
				.describe("Last message object { key: {...} }"),
		}),
		run: (args) =>
			getClient().request("POST", `/chat/archiveChat/${args.instanceName}`, {
				data: {
					chat: args.chat,
					archive: args.archive,
					lastMessage: args.lastMessage,
				},
			}),
	}),

	defineTool({
		name: "delete_message_for_everyone",
		description: "Delete a message for everyone in the chat.",
		schema: z.object({
			instanceName,
			id: z.string().describe("Message ID"),
			remoteJid: z.string(),
			fromMe: z.boolean(),
			participant: z
				.string()
				.optional()
				.describe("Participant JID (for group messages)"),
		}),
		run: (args) =>
			getClient().request(
				"DELETE",
				`/chat/deleteMessageForEveryone/${args.instanceName}`,
				{
					data: {
						id: args.id,
						remoteJid: args.remoteJid,
						fromMe: args.fromMe,
						participant: args.participant,
					},
				},
			),
	}),

	defineTool({
		name: "update_message",
		description: "Edit a previously sent text message.",
		schema: z.object({
			instanceName,
			number,
			text: z.string().describe("New text content"),
			key: z.object({
				remoteJid: z.string(),
				fromMe: z.boolean(),
				id: z.string(),
			}),
		}),
		run: (args) =>
			getClient().request("POST", `/chat/updateMessage/${args.instanceName}`, {
				data: { number: args.number, text: args.text, key: args.key },
			}),
	}),

	defineTool({
		name: "send_chat_presence",
		description:
			"Send a typing/recording presence to a chat (composing, recording or paused).",
		schema: z.object({
			instanceName,
			number,
			presence: z.enum(["composing", "recording", "paused"]),
			delay: z
				.number()
				.optional()
				.describe("How long to keep the presence, in ms"),
		}),
		run: (args) =>
			getClient().request("POST", `/chat/sendPresence/${args.instanceName}`, {
				data: {
					number: args.number,
					presence: args.presence,
					delay: args.delay,
				},
			}),
	}),

	defineTool({
		name: "update_block_status",
		description: "Block or unblock a contact.",
		schema: z.object({
			instanceName,
			number,
			status: z.enum(["block", "unblock"]),
		}),
		run: (args) =>
			getClient().request(
				"POST",
				`/chat/updateBlockStatus/${args.instanceName}`,
				{ data: { number: args.number, status: args.status } },
			),
	}),

	defineTool({
		name: "fetch_profile_picture_url",
		description: "Get the profile picture URL of a contact.",
		schema: z.object({ instanceName, number }),
		run: (args) =>
			getClient().request(
				"POST",
				`/chat/fetchProfilePictureUrl/${args.instanceName}`,
				{ data: { number: args.number } },
			),
	}),

	defineTool({
		name: "get_base64_from_media_message",
		description: "Download a media message and return it as base64.",
		schema: z.object({
			instanceName,
			message: z
				.record(z.string(), z.unknown())
				.describe("Message object containing { key: {...} }"),
			convertToMp4: z.boolean().optional(),
		}),
		run: (args) =>
			getClient().request(
				"POST",
				`/chat/getBase64FromMediaMessage/${args.instanceName}`,
				{
					data: { message: args.message, convertToMp4: args.convertToMp4 },
				},
			),
	}),
];
