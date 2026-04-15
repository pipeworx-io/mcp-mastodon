# mcp-mastodon

Mastodon MCP — public Mastodon data via mastodon.social (no auth required)

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `get_trending` | Get currently trending statuses on mastodon.social. |
| `get_account` | Get a public Mastodon account profile by numeric account ID. |
| `get_timeline` | Get recent posts from the mastodon.social public timeline. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "mastodon": {
      "url": "https://gateway.pipeworx.io/mastodon/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use mastodon
```

## License

MIT
