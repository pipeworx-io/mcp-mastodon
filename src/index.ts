interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Mastodon MCP — public Mastodon data via mastodon.social (no auth required)
 *
 * Tools:
 * - search: Search for accounts, statuses, or hashtags
 * - get_trending: Get trending statuses on mastodon.social
 * - get_account: Get a public account profile by ID
 * - get_timeline: Get the public timeline
 */


const BASE = 'https://mastodon.social/api';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description:
      'Search Mastodon for accounts, statuses, or hashtags on mastodon.social.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query string',
        },
        type: {
          type: 'string',
          description: 'Type of results: accounts, statuses, or hashtags (default: statuses)',
        },
        limit: {
          type: 'number',
          description: 'Number of results to return (default: 10, max: 40)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_trending',
    description: 'Get currently trending statuses on mastodon.social.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of trending statuses to return (default: 10, max: 40)',
        },
      },
    },
  },
  {
    name: 'get_account',
    description: 'Get a public Mastodon account profile by numeric account ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Numeric Mastodon account ID (e.g. "109302436954721982")',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_timeline',
    description: 'Get recent posts from the mastodon.social public timeline.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of statuses to return (default: 20, max: 40)',
        },
      },
    },
  },
];

interface MastodonAccount {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  note: string;
  url: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  created_at: string;
  bot: boolean;
  avatar: string;
}

interface MastodonStatus {
  id: string;
  created_at: string;
  url: string;
  content: string;
  visibility: string;
  favourites_count: number;
  reblogs_count: number;
  replies_count: number;
  account: {
    id: string;
    username: string;
    acct: string;
    display_name: string;
  };
  tags: Array<{ name: string; url: string }>;
  language?: string | null;
  sensitive: boolean;
  spoiler_text?: string;
}

interface MastodonHashtag {
  name: string;
  url: string;
  history?: Array<{ day: string; uses: string; accounts: string }>;
}

interface MastodonSearchResult {
  accounts: MastodonAccount[];
  statuses: MastodonStatus[];
  hashtags: MastodonHashtag[];
}

function mapStatus(s: MastodonStatus) {
  return {
    id: s.id,
    created_at: s.created_at,
    url: s.url,
    content: s.content,
    visibility: s.visibility,
    favourites_count: s.favourites_count,
    reblogs_count: s.reblogs_count,
    replies_count: s.replies_count,
    language: s.language ?? null,
    sensitive: s.sensitive,
    spoiler_text: s.spoiler_text || null,
    tags: s.tags.map((t) => t.name),
    account: {
      id: s.account.id,
      username: s.account.username,
      acct: s.account.acct,
      display_name: s.account.display_name,
    },
  };
}

function mapAccount(a: MastodonAccount) {
  return {
    id: a.id,
    username: a.username,
    acct: a.acct,
    display_name: a.display_name,
    url: a.url,
    followers_count: a.followers_count,
    following_count: a.following_count,
    statuses_count: a.statuses_count,
    created_at: a.created_at,
    bot: a.bot,
    avatar: a.avatar,
    note: a.note,
  };
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search': {
      const query = args.query as string;
      const type = (args.type as string) ?? 'statuses';
      const limit = Math.max(1, Math.min(40, (args.limit as number) ?? 10));

      const params = new URLSearchParams({ q: query, type, limit: String(limit) });
      const res = await fetch(`${BASE}/v2/search?${params}`);
      if (!res.ok) throw new Error(`Mastodon search error: ${res.status}`);

      const data = (await res.json()) as MastodonSearchResult;

      return {
        query,
        type,
        accounts: data.accounts.map(mapAccount),
        statuses: data.statuses.map(mapStatus),
        hashtags: data.hashtags.map((h) => ({
          name: h.name,
          url: h.url,
        })),
      };
    }

    case 'get_trending': {
      const limit = Math.max(1, Math.min(40, (args.limit as number) ?? 10));

      const params = new URLSearchParams({ limit: String(limit) });
      const res = await fetch(`${BASE}/v1/trends/statuses?${params}`);
      if (!res.ok) throw new Error(`Mastodon trending error: ${res.status}`);

      const data = (await res.json()) as MastodonStatus[];

      return {
        count: data.length,
        statuses: data.map(mapStatus),
      };
    }

    case 'get_account': {
      const id = args.id as string;

      const res = await fetch(`${BASE}/v1/accounts/${id}`);
      if (!res.ok) throw new Error(`Mastodon account error: ${res.status}`);

      const data = (await res.json()) as MastodonAccount;

      return mapAccount(data);
    }

    case 'get_timeline': {
      const limit = Math.max(1, Math.min(40, (args.limit as number) ?? 20));

      const params = new URLSearchParams({ limit: String(limit) });
      const res = await fetch(`${BASE}/v1/timelines/public?${params}`);
      if (!res.ok) throw new Error(`Mastodon timeline error: ${res.status}`);

      const data = (await res.json()) as MastodonStatus[];

      return {
        count: data.length,
        statuses: data.map(mapStatus),
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool } satisfies McpToolExport;
