# fal-nano-mcp

A minimal MCP server hardcoded to use [Nano Banana 2](https://fal.ai/models/fal-ai/nano-banana-2) via [Fal AI](https://fal.ai). It exposes exactly two tools:

- **`generate_image`** — text-to-image generation
- **`edit_image`** — image-to-image editing (supports local file paths and URLs)
- **`show_version`** — display the server version

No model selection, no routing — just Nano Banana 2.

## Tools

### `generate_image`

Generate images from text prompts.

**Required:** `prompt` (string)

**Optional:** `num_images` (1-4), `aspect_ratio`, `output_format` (jpeg/png/webp), `resolution` (0.5K/1K/2K/4K), `seed`, `safety_tolerance` (1-6), `enable_web_search`, `thinking_level` (minimal/high)

### `edit_image`

Edit existing images with a text prompt.

**Required:** `prompt` (string), `image_urls` (array of image URLs or absolute local file paths)

**Optional:** Same as `generate_image`

Local file paths are uploaded to Fal's temporary storage before processing. Supported path formats:
- Absolute paths: `/home/user/photo.jpg`
- Tilde paths: `~/photo.jpg`
- `file://` URIs: `file:///home/user/photo.jpg`
- HTTP/HTTPS URLs (passed through directly)

### `show_version`

Returns the current server version. No inputs required.

## Setup

### 1. Get a Fal API Key

Sign up at [fal.ai](https://fal.ai) and create an API key.

### 2. Install

```bash
npm install -g fal-nano-mcp
```

### 3. Add to your MCP client

#### Claude Code (CLI)

```bash
claude mcp add fal-nano-mcp -e FAL_KEY=your-fal-api-key-here -- fal-nano-mcp
```

#### JSON config (Claude Code, Claude Desktop, Cursor, etc.)

Add to your MCP config file (e.g. `~/.claude/settings.json`, `claude_desktop_config.json`, `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "fal-nano-mcp": {
      "command": "fal-nano-mcp",
      "env": {
        "FAL_KEY": "your-fal-api-key-here"
      }
    }
  }
}
```

### 4. Verify

Restart your MCP client and the `generate_image`, `edit_image`, and `show_version` tools should be available.

### MetaMCP (Docker) Setup

If you run MetaMCP in a Docker container, the MCP server runs inside the container and **cannot access host filesystem paths by default**. To enable `edit_image` with local file paths, mount your home directory into the MetaMCP container.

Add this volume to the `app` service in your `docker-compose.yml`:

```yaml
volumes:
  - /home/youruser:/home/youruser:ro
```

The `:ro` (read-only) flag is recommended since the server only needs to read files. After updating, restart MetaMCP:

```bash
docker compose down && docker compose up -d
```

## Usage Examples

**Generate an image:**
> "Generate an image of a sunset over Jerusalem"

**Edit an image:**
> "Edit this image to add a rainbow" (with image URL)

## Pricing

~$0.08 per image at 1K resolution. 2K and 4K cost 1.5x and 2x respectively. See [fal.ai pricing](https://fal.ai/pricing).

## License

MIT
