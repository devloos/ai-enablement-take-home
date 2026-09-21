# My approach

So my task was to build a MCP server and skill for exploring DummyJSON products, carts, and customers.

The way I am thinking about this instead of building multiple tools for each endpoint. I want to build a single tool that can be used to explore the entire DummyJSON API.

That being said, I want to somehow scope the API to only products, carts, and customers (for now).

So two tools come to mind: describe_api and query_api.

Generic enough to be used for any api but using describe_api we can scope what is allowed to be queried.
