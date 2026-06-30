#!/usr/bin/env node
import "dotenv/config";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	type CallToolRequest,
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createTools } from "./tools/index.js";

export const VERSION = "1.0.0";

const server = new Server(
	{ name: "MCP-WHATSAPP-EVO", version: VERSION },
	{ capabilities: { tools: {} } },
);

const tools = createTools();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
	tools: tools.map(({ handler, ...tool }) => tool),
}));

server.setRequestHandler(
	CallToolRequestSchema,
	async (request: CallToolRequest) => {
		const { name, arguments: args } = request.params;
		const tool = tools.find((t) => t.name === name);
		if (!tool) {
			return {
				content: [{ type: "text", text: `Unknown tool: ${name}` }],
				isError: true,
			};
		}
		return tool.handler(args);
	},
);

async function runServer() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error(
		`MCP-WHATSAPP-EVO v${VERSION} running on stdio with ${tools.length} tools`,
	);
}

runServer().catch((error) => {
	console.error("Fatal error running server:", error);
	process.exit(1);
});
