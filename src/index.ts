import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { getAPIDescription } from "./util.js";

const INSTRUCTIONS = `
Read-only access to the DummyJSON demo store: products, carts, and users (customers).
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

  return server;
}

const handle = serveStdio(buildServer);

const exit = async () => {
  await handle.close();
  process.exit(0);
};

process.on("SIGINT", exit);
process.on("SIGTERM", exit);
