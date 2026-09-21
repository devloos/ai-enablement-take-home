# My approach

So my task was to build a MCP server and skill for exploring DummyJSON products, carts, and customers.

We should pacakge this up into a claude plugin.

The way I am thinking about this instead of building multiple tools for each endpoint. I want to build a single tool that can be used to explore the entire DummyJSON API.

That being said, I want to somehow scope the API to only products, carts, and customers (for now).

So two tools come to mind: describe_api and query_api.

Generic enough to be used for any api but using describe_api we can scope what is allowed to be queried.

For the skill, I decided to do a real world workflow. A user wants to retarget abandoned carts. Specifically, they want to target carts that have all products in stock and are ordered by highest potential revenue.

This then returns a list of carts, customer info for the retargeting, and revenue potential for each cart.

# Major Design Decisions

For describe_api, I decided some markdown metadata would be sufficient to describe the API. Possibly just using a list of resources and their endpoints.

This would allow us to plug that info into the markdown and have a nice description of the API.

Since this is a shorter take home, I decided to skip a more robust omit sensitive fields feature. I instead just added to the tool call directly to omit certain fields.

I had AI generate the relationships for me.

---

For query_api, I decided to use a simple input schema that would be easy to understand and use (I had AI generate it for me using zod).

I also added a timeout to the queryApi function to prevent the server from hanging.

If query fails, that is expressed to the model in the response.

Otherwise, the response is just the raw JSON.

---

For the skill, I passed AI the workflow and steps I would take manually to complete the task. I then had AI generate the skill.md file.

## Things I'd improve

- **Turn resources into real classes.** Right now they're plain config objects. Classes would give proper type checking and let relationships (`cart.user`, `cart.products[].product`) be easier to reason about.
- **Strip sensitive fields in code, not by instruction.** The server currently tells the model not to request `password`, `ssn`, `bank`, etc. A prompt can easily be ignored.
- Serve the API reference as an MCP resource instead of a tool
