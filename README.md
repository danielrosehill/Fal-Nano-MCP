# fal-nano-mcp

MCP server for generating and editing images using [Nano Banana 2](https://fal.ai/models/fal-ai/nano-banana-2) (Google's image generation/editing model) via [Fal AI](https://fal.ai).

## Tools

### `generate_image`

Generate images from text prompts.

**Required:** `prompt` (string)

**Optional:** `num_images` (1-4), `aspect_ratio`, `output_format` (jpeg/png/webp), `resolution` (0.5K/1K/2K/4K), `seed`, `safety_tolerance` (1-6), `enable_web_search`, `thinking_level` (minimal/high)

### `edit_image`

Edit existing images with a text prompt.

**Required:** `prompt` (string), `image_urls` (array of URLs)

**Optional:** Same as `generate_image`

## Setup

### 1. Get a Fal API Key

Sign up at [fal.ai](https://fal.ai) and create an API key.

### 2. Install

```bash
npm install -g fal-nano-mcp
```

### 3. Add to Claude Code

```bash
claude mcp add fal-nano-mcp -e FAL_KEY=your-fal-api-key-here -- fal-nano-mcp
```

Or manually add to your Claude Code MCP config (`~/.claude/settings.json`):

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

Restart Claude Code and the `generate_image` and `edit_image` tools should be available.

## Usage Examples

**Generate an image:**
> "Generate an image of a sunset over Jerusalem"

**Edit an image:**
> "Edit this image to add a rainbow" (with image URL)

## Pricing

~$0.08 per image at 1K resolution. 2K and 4K cost 1.5x and 2x respectively. See [fal.ai pricing](https://fal.ai/pricing).

## License

MIT
