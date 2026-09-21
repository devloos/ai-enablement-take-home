/**
 * Single source of truth for what the server knows about DummyJSON.
 * - describe_api renders it into docs for the model
 * Adding a resource = adding one entry here.
 */

export const BASE_URL = "https://dummyjson.com";

export const RESOURCE_NAMES = ["products", "carts", "users"] as const;
export type ResourceName = (typeof RESOURCE_NAMES)[number];

export interface RouteMetadata {
  path: string;
  purpose: string;
}

export interface ResourceMetadata {
  description: string;
  /** Key holding the array in list responses, e.g. { products: [...] } */
  listKey: string;
  routes: RouteMetadata[];
  /** Field → what it means. Only fields worth explaining to a non-technical user. */
  fields: Record<string, string>;
  relationships: string[];
}

export const RESOURCES: Record<ResourceName, ResourceMetadata> = {
  products: {
    description: "Catalog of products.",
    listKey: "products",
    routes: [
      {
        path: "",
        purpose: "List products. Supports limit, skip, select, sortBy, order.",
      },
      { path: "/{id}", purpose: "One product by id." },
      {
        path: "/search?q={text}",
        purpose: "Search title/description. Case-insensitive.",
      },
      {
        path: "/category/{slug}",
        purpose: "Products in one category, e.g. /category/smartphones.",
      },
      {
        path: "/category-list",
        purpose: "All category slugs (plain string array).",
      },
    ],
    fields: {
      price: "Current price in USD.",
      discountPercentage: "Current discount. Price shown is before discount.",
      stock: "Units on hand right now.",
      availabilityStatus: "'In Stock', 'Low Stock', or 'Out of Stock'.",
      rating: "Average review score, 0–5.",
      minimumOrderQuantity: "Smallest quantity that can be ordered.",
    },
    relationships: ["carts[].products[].id refers to products.id"],
  },

  carts: {
    description:
      "208 shopping carts, one per user. Each line is a snapshot of the product at cart time.",
    listKey: "carts",
    routes: [
      { path: "", purpose: "List carts. Supports limit, skip." },
      { path: "/{id}", purpose: "One cart by cart id." },
      {
        path: "/user/{userId}",
        purpose: "All carts belonging to a user. The usual entry point.",
      },
    ],
    fields: {
      userId: "Owner of the cart → users.id.",
      "products[].id":
        "Product id → products.id. Use it to fetch live stock/price.",
      "products[].price":
        "Price at the time the item was added. May differ from the live product price.",
      "products[].quantity": "Units of that product in the cart.",
      "products[].discountedTotal": "Line total after discount.",
      total: "Cart total before discounts.",
      discountedTotal:
        "Cart total after discounts. What the customer would pay.",
    },
    relationships: [
      "carts.userId refers to users.id",
      "carts.products[].id refers to products.id",
    ],
  },

  users: {
    description:
      "208 customers. Contains sensitive fields (password, ssn, ein, bank, crypto, ip, macAddress) — " +
      "never request or display them.",
    listKey: "users",
    routes: [
      {
        path: "",
        purpose: "List users. Supports limit, skip, select, sortBy, order.",
      },
      { path: "/{id}", purpose: "One user by id." },
      {
        path: "/search?q={text}",
        purpose:
          "Search by name, email, or username. Partial match. May return several people.",
      },
      {
        path: "/filter?key={field}&value={value}",
        purpose:
          "Exact match on a field. Nested keys allowed, e.g. key=address.city&value=Phoenix.",
      },
    ],
    fields: {
      role: "'admin', 'moderator', or 'user'.",
      address: "Object: address, city, state, postalCode, country.",
      company: "Object: name, department, title.",
    },
    relationships: ["users.id is referenced by carts.userId"],
  },
};

/** Get the API description as markdown for describe_api. */
/* prettier-ignore */
export function getAPIDescription(): string {
  const lines: string[] = [
    `
# DummyJSON API Description
Base URL: ${BASE_URL}. All endpoints are GET and need no auth.
List endpoints return { <listKey>: [...], total, skip, limit }.

## Common query params
limit - Max items to return. Default 30. Use 0 for all.
skip - Items to skip, for paging.
select - Comma-separated top-level fields to return. Nested paths (address.city) are ignored.
sortBy - Field to sort by (list endpoints only).
order - asc or desc. Use with sortBy.

# Selecting fields
When calling an endpoint, you can specify which fields to return.
For example, to return only the id and title of a product, you can call:

GET ${BASE_URL}/products?select=id,title

To return all fields, you can call:

GET ${BASE_URL}/products?select=*
    `
  ];

  for (const [name, doc] of Object.entries(RESOURCES)) {
    lines.push(
      ``,
      `## ${name}`,
      doc.description,
      ``,
      `Routes (relative to /${name}):`
    );

    for (const r of doc.routes) {
      lines.push(`- /${name}${r.path} — ${r.purpose}`);
    }

    lines.push(``, `Fields worth knowing:`);
    for (const [f, meaning] of Object.entries(doc.fields)) {
      lines.push(`- ${f}: ${meaning}`);
    }

    lines.push(``, `Relationships:`);
    for (const rel of doc.relationships) {
      lines.push(`- ${rel}`);
    }
  }

  return lines.join("\n");
}
