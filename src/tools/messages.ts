import { z } from "zod";
import { getClient } from "../lib/client.js";
import { defineTool } from "../lib/defineTool.js";

const instanceName = z.string().describe("Name of the Evolution API instance");
const number = z
	.string()
	.describe("Recipient phone number with country code, e.g. 5491112345678");

// Optional fields shared by most /message/* endpoints.
const common = {
	delay: z.number().optional().describe("Delay in milliseconds before sending"),
	mentionsEveryOne: z.boolean().optional(),
	mentioned: z.array(z.string()).optional().describe("Phone numbers to mention"),
	quoted: z
		.object({
			key: z.object({
				remoteJid: z.string(),
				fromMe: z.boolean(),
				id: z.string(),
				participant: z.string().optional(),
			}),
			message: z.object({ conversation: z.string() }),
		})
		.optional()
		.describe("Message to quote/reply to"),
};

/** Build the request body, dropping the instanceName routing field. */
const body = <T extends { instanceName: string }>(args: T) => {
	const { instanceName: _i, ...rest } = args;
	return rest;
};

const send = (endpoint: string) => (args: { instanceName: string }) =>
	getClient().request("POST", `/message/${endpoint}/${args.instanceName}`, {
		data: body(args),
	});

export const messageTools = [
	defineTool({
		name: "send_plain_text",
		description: "Send a plain text message to a WhatsApp number.",
		schema: z.object({
			instanceName,
			number,
			text: z.string().describe("Message text content"),
			linkPreview: z.boolean().optional(),
			...common,
		}),
		run: send("sendText"),
	}),

	defineTool({
		name: "send_media",
		description:
			"Send a media message (image, video, audio or document) by URL or base64.",
		schema: z.object({
			instanceName,
			number,
			mediatype: z.enum(["image", "video", "audio", "document"]),
			media: z.string().describe("URL or base64 of the media"),
			mimetype: z.string().optional(),
			fileName: z.string().optional(),
			caption: z.string().optional(),
			...common,
		}),
		run: send("sendMedia"),
	}),

	defineTool({
		name: "send_whatsapp_audio",
		description: "Send a WhatsApp voice note (PTT) by URL or base64.",
		schema: z.object({
			instanceName,
			number,
			audio: z.string().describe("URL or base64 of the audio"),
			encoding: z.boolean().optional(),
			...common,
		}),
		run: send("sendWhatsAppAudio"),
	}),

	defineTool({
		name: "send_sticker",
		description: "Send a sticker by URL or base64.",
		schema: z.object({
			instanceName,
			number,
			sticker: z.string().describe("URL or base64 of the sticker"),
			...common,
		}),
		run: send("sendSticker"),
	}),

	defineTool({
		name: "send_location",
		description: "Send a location message.",
		schema: z.object({
			instanceName,
			number,
			name: z.string(),
			address: z.string(),
			latitude: z.number(),
			longitude: z.number(),
			...common,
		}),
		run: send("sendLocation"),
	}),

	defineTool({
		name: "send_contact",
		description: "Send one or more contact cards (vCards).",
		schema: z.object({
			instanceName,
			number,
			contact: z.array(
				z.object({
					fullName: z.string().optional(),
					wuid: z.string().describe("WhatsApp number/JID"),
					phoneNumber: z.string(),
					organization: z.string().optional(),
					email: z.string().optional(),
					url: z.string().optional(),
				}),
			),
			...common,
		}),
		run: send("sendContact"),
	}),

	defineTool({
		name: "send_reaction",
		description: "React to a message with an emoji.",
		schema: z.object({
			instanceName,
			reactionMessage: z.object({
				key: z.object({
					remoteJid: z.string(),
					fromMe: z.boolean(),
					id: z.string(),
				}),
				reaction: z.string().describe("Emoji to react with"),
			}),
		}),
		run: send("sendReaction"),
	}),

	defineTool({
		name: "send_poll",
		description: "Send a poll message.",
		schema: z.object({
			instanceName,
			number,
			name: z.string().describe("Poll question"),
			selectableCount: z.number().describe("How many options can be selected"),
			values: z.array(z.string()).describe("Poll options"),
			...common,
		}),
		run: send("sendPoll"),
	}),

	defineTool({
		name: "send_list",
		description: "Send an interactive list message.",
		schema: z.object({
			instanceName,
			number,
			title: z.string(),
			description: z.string(),
			buttonText: z.string(),
			footerText: z.string().optional(),
			sections: z.array(
				z.object({
					title: z.string(),
					rows: z.array(
						z.object({
							title: z.string(),
							description: z.string().optional(),
							rowId: z.string(),
						}),
					),
				}),
			),
			...common,
		}),
		run: send("sendList"),
	}),

	defineTool({
		name: "send_buttons",
		description: "Send a message with interactive buttons.",
		schema: z.object({
			instanceName,
			number,
			title: z.string(),
			description: z.string(),
			footer: z.string().optional(),
			buttons: z.array(
				z.object({
					buttonId: z.string(),
					buttonText: z.string(),
				}),
			),
			...common,
		}),
		run: send("sendButtons"),
	}),

	defineTool({
		name: "send_status",
		description: "Post a WhatsApp status/story (text, image or audio).",
		schema: z.object({
			instanceName,
			statusMessage: z.object({
				type: z.enum(["text", "image", "audio"]),
				content: z.string(),
				caption: z.string().optional(),
				backgroundColor: z.string().optional(),
				font: z.number().optional(),
				allContacts: z.boolean(),
				statusJidList: z.array(z.string()).optional(),
			}),
		}),
		run: send("sendStatus"),
	}),

	defineTool({
		name: "send_ptv",
		description: "Send a PTV (round video note) by URL or base64.",
		schema: z.object({
			instanceName,
			number,
			video: z.string().describe("URL or base64 of the video"),
			...common,
		}),
		run: send("sendPtv"),
	}),

	defineTool({
		name: "send_template",
		description:
			"Send an approved WhatsApp Business template message. Only works on WHATSAPP-BUSINESS (Cloud API) instances.",
		schema: z.object({
			instanceName,
			number,
			name: z.string().describe("Template name"),
			language: z.string().describe("Template language code, e.g. en_US"),
			components: z
				.array(z.record(z.string(), z.unknown()))
				.optional()
				.describe("Template components (header/body/buttons parameters)"),
		}),
		run: send("sendTemplate"),
	}),
];
