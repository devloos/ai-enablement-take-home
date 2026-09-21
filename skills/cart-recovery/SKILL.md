---
name: cart-recovery
description: Build an outreach list of high-value shopping carts that can still be fulfilled. Use when someone asks for abandoned carts, cart recovery, carts to target or follow up on, top carts by value, or which customers to contact about their cart. Returns customer name, email, cart value, and item count.
---

# Cart recovery list

Find the top N carts by value where every item is still in stock, and return the
customer contact details so an employee can follow up. Default N = 10.

## Steps

1. If you have not called `describe_api` this session, call it now.

2. Get live stock for every product. One call, small response:

   ```
   query { resource: "products", params: { limit: 0, select: "id,title,stock" } }
   ```

   Build a map of product id → { title, stock }.

3. Get a candidate pool of the highest-value carts. Fetch 3×N (minimum 20) so the
   filter in step 4 still leaves N results:

   ```
   query { resource: "carts", params: { sortBy: "discountedTotal", order: "desc", limit: <3×N> } }
   ```

   Do NOT use `limit: 0` on carts as it can return a lot of data.

4. Filter. A cart is recoverable only if **every** line satisfies
   `stock >= quantity` using the map from step 2. Keep the first N that pass.

   - If fewer than N pass, fetch the next page with `skip: <pool size>` and repeat.
   - A product id missing from the map counts as not fulfillable.

5. For each surviving cart, get the customer's contact details:
   ```
   query { resource: "users", path: "/<userId>", params: { select: "id,firstName,lastName,email" } }
   ```
   Never request or show any other user fields.

## Output

A markdown table, ranked by cart value:

| #   | Customer      | Email                         | Cart | Value      | Items |
| --- | ------------- | ----------------------------- | ---- | ---------- | ----- |
| 1   | Emily Johnson | emily.johnson@x.dummyjson.com | #1   | $11,510.81 | 4     |

Value = `discountedTotal` (what the customer would actually pay). Format as USD.

## Rules

- Use only `discountedTotal`, `userId`, and `products[].{id,quantity,title}` from carts.
- Cart line `price` is a snapshot; ignore it. Stock comes from step 2 only.
- If the person asks for a different N, use it. If they ask for something this skill
  doesn't cover (date ranges, categories), say the data doesn't support it rather than guessing.
- Plain English. No JSON in the answer.
