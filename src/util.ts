export const BASE_URL = "https://dummyjson.com";

/** Get the API description as markdown for describe_api. */
/* prettier-ignore */
export function getAPIDescription(): string {
  return `
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
    `;
}
