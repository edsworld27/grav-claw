# Gravity Claw

A secure, personal AI agent with zero-trust architecture and XML prompt injection defense.

## Zero-Trust Deployment & Launch

Gravity Claw is built with an extreme Zero-Trust architecture, including a Triple-Airgapped Research Swarm and an explicitly defined Filesystem Blast Zone. Follow these precise steps to launch securely.

### 1. Launch the Browser Submarine
Gravity Claw executes web research through an isolated, headless Chromium container to physically protect your host machine from zero-day browser exploits.
```bash
cd "00 local/scraper-sandbox"
docker build -t scraper-sandbox .
docker run -d -p 8080:8080 --name gravity-submarine scraper-sandbox
```

*(Note: Requires Docker Desktop or OrbStack running).*

### 2. Configure the Execution Blast Zone
Gravity Claw uses an MCP server to read and write files. By default, it is mechanically locked to only access its own `data/` folder.
To grant it access to other specific project directories on your machine, edit the allowed paths in `data/mcp_servers.json`. If an attacker tries to prompt the agent to read files outside this list, the execution engine will brutally reject the read.

### 3. Initialize Core Server
```bash
cd "00 local/gravity claw"
npm install
npm start
```

The interactive wizard walks you through:
1. Tailscale & Docker checks
   - **Tip for Mac Users:** We recommend [OrbStack](https://orbstack.dev/) as a faster, lighter alternative to Docker Desktop.
2. Temp OpenRouter key (30 min, £5 limit)
3. Telegram bot setup
4. Security key generation
5. Supabase connection (optional)
6. Mission Control setup (optional)

**You never enter permanent API keys.** Test keys expire, real keys go through the secure proxy.

### Dev Mode (Skip Setup)

For development/testing, bypass setup entirely:

```bash
npm run dev:skip-setup
```

This launches Mission Control in **Sandbox Mode**:
- **Port:** `http://localhost:3001`
- **Key:** `sandbox_key`
- API calls disabled (UI testing only)

---

## After Setup

```bash
npm run proxy       # Terminal 1 - Secure proxy (port 4000)
npm run dev         # Terminal 2 - Agent
npm run dashboard   # Terminal 3 - Mission Control (port 3001)
```

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   You           │────▶│  Telegram/      │────▶│  Gravity Claw   │
│   (Human)       │     │  Discord/etc    │     │  Agent          │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  Secure Proxy   │
                                                │  (Agent Keys)   │
                                                └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┼────────────────────────────────┐
                        ▼                                ▼                                ▼
                ┌──────────────┐                ┌──────────────┐                ┌──────────────┐
                │  Anthropic   │                │   OpenAI     │                │  OpenRouter  │
                └──────────────┘                └──────────────┘                └──────────────┘
```

## Security

- **Agent Keys** - Cryptographic `gc-agent-xxx` identifiers
- **XML Boundaries** - User input structurally separated
- **Secure Proxy** - Real keys never touch agent code
- **Zero Trust** - No key = rejected

## Never Commit

```
.env
proxy/.env.real
data/
mission-control/.env.local
```

## License

MIT
