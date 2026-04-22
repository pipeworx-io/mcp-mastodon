# mcp-mastodon

Mastodon MCP — public Mastodon data via mastodon.social (no auth required)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_trending` | Get currently trending posts on Mastodon. Returns popular statuses with engagement counts, authors, and trending tags. |
| `get_account` | Get a Mastodon account profile by ID (e.g., \'109382839472938472\'). Returns bio, follower/following counts, post history, and verification status. |
| `get_timeline` | Get recent posts from the public Mastodon timeline. Returns statuses with authors, timestamps, engagement counts, and content. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "mastodon": {
      "url": "https://gateway.pipeworx.io/mastodon/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Mastodon data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
