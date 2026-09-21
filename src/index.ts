import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { getAPIDescription } from "./util.js";
import { QueryInputSchema, queryApi } from "./api.js";

const INSTRUCTIONS = `
Read-only access to the DummyJSON demo store: products, carts, and users (customers).
Call describe_api once to learn routes, fields, and how the three relate.
Users contain sensitive fields (password, ssn, bank, crypto, ip, macAddress) —
never request or display them. Present results in plain English for non-technical users.
`;

function buildServer() {
  const server = new McpServer(
    { name: "dummyjson", version: "0.1.0" },
    { instructions: INSTRUCTIONS }
  );

  server.registerTool(
    "describe_api",
    {
      title: "Describe the DummyJSON API",
      description:
        "Returns routes, query params, notable fields, and relationships for products, carts, and users. Call this once before using query.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async () => ({ content: [{ type: "text", text: getAPIDescription() }] })
  );

  server.registerTool(
    "query_api",
    {
      title: "Query the DummyJSON API",
      description:
        "GET one DummyJSON endpoint. Pick a resource, an optional path under it, and query params. Returns raw JSON. Errors (e.g. 404) come back as text with isError so you can recover.",
      inputSchema: QueryInputSchema,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async (input) => {
      const result = await queryApi(input);

      if (!result.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${result.message}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result.data) }],
      };
    }
  );

  return server;
}

const handle = serveStdio(buildServer);

const exit = async () => {
  await handle.close();
  process.exit(0);
};

process.on("SIGINT", exit);
process.on("SIGTERM", exit);
