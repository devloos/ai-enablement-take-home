# My approach

So my task was to build a MCP server and skill for exploring DummyJSON products, carts, and customers.

The way I am thinking about this instead of building multiple tools for each endpoint. I want to build a single tool that can be used to explore the entire DummyJSON API.

That being said, I want to somehow scope the API to only products, carts, and customers (for now).

So two tools come to mind: describe_api and query_api.

Generic enough to be used for any api but using describe_api we can scope what is allowed to be queried.

# Major Design Decisions

For describe_api, I decided some markdown metadata would be sufficient to describe the API. Possibly just using a list of resources and their endpoints.

This would allow us to plug that info into the markdown and have a nice description of the API.

Since this is a shorter take home, I decided to skip a more robust omit sensitive fields feature. I instead just added to the tool call directly to omit certain fields.

I had AI generate the relationships for me.
