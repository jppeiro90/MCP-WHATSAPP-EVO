# MCP-WHATSAPP-EVO

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that exposes the **full WhatsApp surface of the [Evolution API](https://github.com/EvolutionAPI/evolution-api)** to MCP clients such as Claude Code, Claude Desktop and Cursor.

Unlike most Evolution MCP servers, this one can **read message history** (`find_messages`) and covers ~69 tools across instances, messaging, chats, profile, groups, labels, templates and calls.

- **Transport:** stdio
- **Runtime:** Node.js ≥ 18 (no Bun required)
- **Auth:** the global Evolution API key, sent as the `apikey` header

## Tools

| Category | Tools |
|----------|-------|
| **Instances** (9) | `fetch_evolution_instances`, `get_connection_state`, `create_evolution_instance`, `connect_evolution_instance`, `restart_evolution_instance`, `set_evolution_presence`, `logout_evolution_instance`, `delete_evolution_instance`, `get_evolution_info` |
| **Send messages** (13) | `send_plain_text`, `send_media`, `send_whatsapp_audio`, `send_sticker`, `send_location`, `send_contact`, `send_reaction`, `send_poll`, `send_list`, `send_buttons`, `send_status`, `send_ptv`, `send_template` |
| **Chat & history** (15) | `find_messages`, `find_chats`, `find_contacts`, `find_chat_by_remote_jid`, `find_status_message`, `check_whatsapp_numbers`, `mark_message_as_read`, `mark_chat_unread`, `archive_chat`, `delete_message_for_everyone`, `update_message`, `send_chat_presence`, `update_block_status`, `fetch_profile_picture_url`, `get_base64_from_media_message` |
| **Profile** (8) | `fetch_business_profile`, `fetch_profile`, `update_profile_name`, `update_profile_status`, `update_profile_picture`, `remove_profile_picture`, `fetch_privacy_settings`, `update_privacy_settings` |
| **Groups** (16) | `fetch_all_groups`, `find_group_by_jid`, `find_group_members`, `create_group`, `update_group_subject`, `update_group_picture`, `update_group_description`, `fetch_invite_code`, `fetch_invite_info`, `accept_invite_code`, `send_group_invite`, `revoke_invite_code`, `update_participant`, `update_group_setting`, `toggle_ephemeral`, `leave_group` |
| **Settings & webhook** (4) | `set_evolution_settings`, `get_evolution_settings`, `set_evolution_webhook`, `get_evolution_webhook` |
| **Labels / Templates / Calls** (5) | `find_labels`, `handle_label`, `find_template`, `create_template`, `offer_call` |

> `*_template` and `send_template` only work on `WHATSAPP-BUSINESS` (Cloud API) instances, not Baileys.

## Setup

```bash
git clone https://github.com/your-username/MCP-WHATSAPP-EVO.git
cd MCP-WHATSAPP-EVO
npm install
npm run build        # produces dist/main.cjs
```

Configuration is done with two environment variables (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `EVOLUTION_API_URL` | Base URL of your Evolution API (no trailing slash) |
| `EVOLUTION_API_KEY` | The global `AUTHENTICATION_API_KEY` of your server |

## Use with Claude Code

```bash
claude mcp add evolution-whatsapp -s user \
  -e EVOLUTION_API_URL=https://evo.example.com \
  -e EVOLUTION_API_KEY=your-key \
  -- node /absolute/path/to/MCP-WHATSAPP-EVO/dist/main.cjs
```

On Windows, point at `node.exe` and the `.cjs` explicitly:

```bash
claude mcp add evolution-whatsapp -s user \
  -e EVOLUTION_API_URL=https://evo.example.com \
  -e EVOLUTION_API_KEY=your-key \
  -- "C:\Program Files\nodejs\node.exe" "C:\path\to\MCP-WHATSAPP-EVO\dist\main.cjs"
```

Then `claude mcp list` should show it as `✔ Connected`. Restart the client to load the tools.

## Use with Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "evolution-whatsapp": {
      "command": "node",
      "args": ["/absolute/path/to/MCP-WHATSAPP-EVO/dist/main.cjs"],
      "env": {
        "EVOLUTION_API_URL": "https://evo.example.com",
        "EVOLUTION_API_KEY": "your-key"
      }
    }
  }
}
```

## Notes on phone numbers & JIDs

- **Numbers** use the international format without `+`, e.g. `5491112345678`.
- **JIDs** are `<number>@s.whatsapp.net` for users and `<id>@g.us` for groups.
- `find_messages` is paginated: use `page` and `offset` (messages per page).

## Security

The Evolution API key grants full control over **every** instance on the server (including personal numbers). Treat it as a secret, scope a dedicated instance/key for automation when possible, and never commit your `.env`.

## Architecture

```
src/
  lib/
    client.ts      # generic Evolution HTTP client (apikey header, error mapping)
    defineTool.ts  # helper: Zod schema -> MCP tool with parsing + error handling
  tools/
    instances.ts messages.ts chat.ts profile.ts groups.ts settings.ts extras.ts
    index.ts       # aggregates every category into createTools()
  main.ts          # MCP server bootstrap (stdio)
```

Adding a new endpoint is one `defineTool({ name, description, schema, run })` block that calls `getClient().request(method, path, { data, params })`.

## License

MIT — see [LICENSE](./LICENSE).
