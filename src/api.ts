import * as z from "zod/v4";
import { BASE_URL, RESOURCE_NAMES } from "./util.js";

/** Zero or more "/segment" pieces. Blocks "?", "..", "//", and absolute URLs. */
const PATH_RE = /^(\/[A-Za-z0-9_-]+)*$/;

export const QueryInputSchema = z.object({
  resource: z
    .enum(RESOURCE_NAMES)
    .describe(
      "Which collection to query. Call describe_api first to see routes and fields."
    ),
  path: z
    .string()
    .regex(
      PATH_RE,
      'Path segments only, e.g. "/1", "/search", "/category/beauty". Put ?q=... in params instead.'
    )
    .default("")
    .describe("Route under the resource. Empty string = the list endpoint."),
  params: z
    .object({
      q: z.string().optional().describe("Search text, for /search routes."),
      limit: z.number().int().min(0).optional().describe("Max items. 0 = all."),
      skip: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("Items to skip, for paging."),
      select: z
        .string()
        .optional()
        .describe(
          "Comma-separated top-level fields. Omit for a sensible default."
        ),
      sortBy: z
        .string()
        .optional()
        .describe("Field to sort by. List endpoints only."),
      order: z.enum(["asc", "desc"]).optional(),
      key: z
        .string()
        .optional()
        .describe("For /filter routes: field name, e.g. address.city"),
      value: z
        .string()
        .optional()
        .describe("For /filter routes: exact value to match."),
    })
    .optional(),
});

export type QueryInput = z.infer<typeof QueryInputSchema>;

export type QueryResult =
  | { ok: true; data: unknown }
  | { ok: false; message: string };

// instead of AI building the URL, make it a bit more deterministic by building it manually
export function buildUrl({ resource, path, params }: QueryInput): URL {
  const url = new URL(`/${resource}${path}`, BASE_URL);

  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined) {
      url.searchParams.set(k, String(v));
    }
  }

  return url;
}

export async function queryApi(input: QueryInput): Promise<QueryResult> {
  const url = buildUrl(input);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return {
        ok: false,
        message: await res.text(),
      };
    }

    return {
      ok: true,
      data: await res.json(),
    };
  } catch (e) {
    const error = e as Error;

    return {
      ok: false,
      message: error.message,
    };
  }
}
