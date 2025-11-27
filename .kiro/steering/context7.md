---
inclusion: always
---

# Context7 MCP Integration

## When to Use Context7

Automatically use Context7 MCP tools whenever you need:

1. **Library Documentation**: API references, usage examples, or best practices for any library
2. **Code Generation**: Writing code that uses external libraries or frameworks
3. **Setup/Configuration**: Installing, configuring, or integrating third-party packages
4. **Troubleshooting**: Debugging issues related to library usage or API calls
5. **Version-Specific Info**: When working with specific versions of libraries

## Workflow

### Step 1: Resolve Library ID
Before fetching documentation, always resolve the library name to a Context7-compatible ID:

```
Use: mcp_Context7_resolve_library_id
Input: Library name (e.g., "react", "tanstack-router", "drizzle-orm")
Output: Context7-compatible library ID (e.g., "/facebook/react", "/tanstack/router")
```

### Step 2: Fetch Documentation
Once you have the library ID, fetch relevant documentation:

```
Use: mcp_Context7_get_library_docs
Input: 
  - context7CompatibleLibraryID: The ID from step 1
  - topic: Specific topic you need (e.g., "hooks", "routing", "queries")
  - mode: "code" for API/examples, "info" for concepts/guides
  - page: Start with 1, increment if more context needed
```

## Examples

### Example 1: Adding a New Feature with TanStack Router
```
Task: Implement file-based routing with search params
1. Resolve: "tanstack-router" → "/tanstack/router"
2. Fetch: topic="search params", mode="code"
3. Implement using the documentation
```

### Example 2: Database Query with Drizzle
```
Task: Write a complex query with joins
1. Resolve: "drizzle-orm" → "/drizzle-team/drizzle-orm"
2. Fetch: topic="joins", mode="code"
3. Write the query following examples
```

### Example 3: React Hook Usage
```
Task: Implement useEffect with cleanup
1. Resolve: "react" → "/facebook/react"
2. Fetch: topic="useEffect", mode="code"
3. Implement with proper cleanup
```

## Best Practices

- **Always resolve first**: Don't guess library IDs, use the resolve tool
- **Be specific with topics**: Use precise topic names for better results
- **Use code mode for implementation**: When writing code, use mode="code"
- **Use info mode for concepts**: When learning architecture, use mode="info"
- **Paginate if needed**: If context isn't sufficient, try page=2, page=3, etc.
- **Cache mentally**: Remember resolved IDs during the same conversation

## Current Project Libraries

For this project, commonly used libraries include:
- TanStack Start: `/tanstack/start`
- TanStack Router: `/tanstack/router`
- React: `/facebook/react`
- Drizzle ORM: `/drizzle-team/drizzle-orm`
- PostgreSQL: `/postgres/postgres`
- Tailwind CSS: `/tailwindlabs/tailwindcss`
- Vite: `/vitejs/vite`
- Vitest: `/vitest-dev/vitest`

## When NOT to Use

- For general programming concepts (loops, conditionals, etc.)
- For code you've already written in this project
- For simple syntax questions you already know
- When the user explicitly asks not to use external docs

## Integration with Workflow

Context7 should be seamlessly integrated into your workflow:
1. User asks for a feature
2. You identify libraries needed
3. You automatically fetch relevant docs
4. You implement using up-to-date information
5. You explain what you did (mentioning you used latest docs)

This ensures all code is written using current best practices and accurate API information.
