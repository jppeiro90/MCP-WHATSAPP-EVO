import type { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ZodType, z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export type ToolRegistration = Tool & {
	handler: (args: unknown) => Promise<CallToolResult>;
};

/**
 * Build a Model Context Protocol tool from a Zod schema and a `run` function.
 *
 * It centralizes the boilerplate that every tool would otherwise repeat:
 *  - converts the Zod schema to JSON Schema for the `tools/list` response,
 *  - validates/parses the incoming arguments,
 *  - serializes the result to text content,
 *  - turns any thrown error into an `isError` result instead of crashing.
 */
export function defineTool<S extends ZodType>(opts: {
	name: string;
	description: string;
	schema: S;
	run: (args: z.infer<S>) => Promise<unknown>;
}): ToolRegistration {
	return {
		name: opts.name,
		description: opts.description,
		inputSchema: zodToJsonSchema(opts.schema, {
			$refStrategy: "none",
		}) as Tool["inputSchema"],
		handler: async (rawArgs: unknown): Promise<CallToolResult> => {
			try {
				const args = opts.schema.parse(rawArgs ?? {});
				const result = await opts.run(args);
				const text =
					typeof result === "string"
						? result
						: JSON.stringify(result, null, 2);
				return { content: [{ type: "text", text }] };
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `Error: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
					isError: true,
				};
			}
		},
	};
}
