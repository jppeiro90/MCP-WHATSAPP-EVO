# Installation Guide — MCP-WHATSAPP-EVO

This MCP server is a standard **Model Context Protocol** server that talks to it
over **stdio**. That means it works with *any* MCP-compatible AI client — the only
thing that changes between them is where you paste the configuration.

---

## 1. Prerequisites

- **Node.js ≥ 18** installed on the machine (`node --version`).
- A reachable **Evolution API** server and its **global API key**
  (the `AUTHENTICATION_API_KEY` of that server).

## 2. Build the server

```bash
git clone https://github.com/your-username/MCP-WHATSAPP-EVO.git
cd MCP-WHATSAPP-EVO
npm install
npm run build        # produces dist/main.cjs
```

Take note of the **absolute path** to `dist/main.cjs` — every client needs it.

## 3. Configure credentials

The server reads two environment variables. You can pass them from the client
config (recommended, see below) or via a local `.env` file:

```bash
cp .env.example .env
# then edit .env:
EVOLUTION_API_URL=https://your-evolution-server.com
EVOLUTION_API_KEY=your-evolution-api-key
```

> Never commit your `.env`. It is already in `.gitignore`.

## 4. The universal config

Every MCP client uses the same shape:

```json
{
  "mcpServers": {
    "evolution-whatsapp": {
      "command": "node",
      "args": ["/absolute/path/to/MCP-WHATSAPP-EVO/dist/main.cjs"],
      "env": {
        "EVOLUTION_API_URL": "https://your-evolution-server.com",
        "EVOLUTION_API_KEY": "your-evolution-api-key"
      }
    }
  }
}
```

**Windows tip:** set `command` to the full path of `node.exe` and double-escape
backslashes, e.g.
`"args": ["C:\\Users\\you\\MCP-WHATSAPP-EVO\\dist\\main.cjs"]`.

---

## 5. Per-client instructions

### Claude Code (CLI)

```bash
claude mcp add evolution-whatsapp -s user \
  -e EVOLUTION_API_URL=https://your-evolution-server.com \
  -e EVOLUTION_API_KEY=your-evolution-api-key \
  -- node /absolute/path/to/MCP-WHATSAPP-EVO/dist/main.cjs
```

Check with `claude mcp list` → should read `✔ Connected`. `-s user` makes it
available in every project; use `-s local` for the current project only.

### Claude Desktop

Edit `claude_desktop_config.json` and add the universal config under `mcpServers`.
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

### Cursor

`~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per project). Same JSON.

### Windsurf

Settings → Cascade → MCP → "Add custom server", or edit
`~/.codeium/windsurf/mcp_config.json`. Same JSON.

### VS Code (GitHub Copilot / Agent mode)

Create `.vscode/mcp.json`. ⚠️ VS Code uses a top-level **`servers`** key (not
`mcpServers`):

```json
{
  "servers": {
    "evolution-whatsapp": {
      "command": "node",
      "args": ["/absolute/path/to/MCP-WHATSAPP-EVO/dist/main.cjs"],
      "env": {
        "EVOLUTION_API_URL": "https://your-evolution-server.com",
        "EVOLUTION_API_KEY": "your-evolution-api-key"
      }
    }
  }
}
```

### Cline / Roo Code (VS Code extensions)

Open the extension's **MCP Servers → Configure** panel and paste the universal
config.

### Continue

`~/.continue/config.yaml` — YAML form of the same fields:

```yaml
mcpServers:
  - name: evolution-whatsapp
    command: node
    args:
      - /absolute/path/to/MCP-WHATSAPP-EVO/dist/main.cjs
    env:
      EVOLUTION_API_URL: https://your-evolution-server.com
      EVOLUTION_API_KEY: your-evolution-api-key
```

### Zed

`settings.json` under `"context_servers"`, same `command`/`args`/`env` fields.

### Any other MCP client

Point it at `command: node`, `args: [".../dist/main.cjs"]` and supply the two env
vars. If the client supports stdio MCP servers, it will work.

---

## 6. Verify it works

After saving the config, **restart the client** so it spawns the server. Then ask
the assistant to run a read-only tool, e.g. *"list my WhatsApp instances"* (calls
`fetch_evolution_instances`). A successful response confirms the connection.

## 7. Troubleshooting

| Symptom | Fix |
|--------|-----|
| `Failed to connect` / server exits immediately | Wrong path to `dist/main.cjs`, or you didn't run `npm run build`. |
| `EVOLUTION_API_URL/KEY environment variable is not set` | The env vars are missing from the client config (or `.env`). |
| `... failed (401)` | Wrong `EVOLUTION_API_KEY`. |
| `... failed (404)` | Wrong `EVOLUTION_API_URL`, or the instance name doesn't exist. |
| Tools don't appear | Restart the client after editing the config. |

## 8. Security

The Evolution API key grants full control over **every** instance on that server.
Treat it as a secret, prefer a dedicated instance/key for automation, and never
commit your `.env`.
