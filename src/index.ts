#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fal } from "@fal-ai/client";
import { z } from "zod";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("Error: FAL_KEY environment variable is required");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

const ASPECT_RATIOS = [
  "auto", "21:9", "16:9", "3:2", "4:3", "5:4",
  "1:1", "4:5", "3:4", "2:3", "9:16", "4:1", "1:4", "8:1", "1:8",
] as const;

const OUTPUT_FORMATS = ["jpeg", "png", "webp"] as const;
const RESOLUTIONS = ["0.5K", "1K", "2K", "4K"] as const;
const SAFETY_TOLERANCES = ["1", "2", "3", "4", "5", "6"] as const;
const THINKING_LEVELS = ["minimal", "high"] as const;

interface FalImage {
  url: string;
  file_name?: string;
  content_type?: string;
  width?: number;
  height?: number;
}

interface FalResult {
  data: {
    images: FalImage[];
    description?: string;
  };
  requestId: string;
}

const server = new McpServer({
  name: "fal-nano-mcp",
  version: "1.0.0",
});

server.registerTool("generate_image", {
  title: "Generate Image",
  description:
    "Generate an image from a text prompt using Nano Banana 2 (Google's image generation model via Fal AI). Returns image URLs.",
  inputSchema: {
    prompt: z
      .string()
      .describe("The text prompt to generate an image from"),
    num_images: z
      .number()
      .int()
      .min(1)
      .max(4)
      .optional()
      .describe("Number of images to generate (1-4). Default: 1"),
    aspect_ratio: z
      .enum(ASPECT_RATIOS)
      .optional()
      .describe("Aspect ratio. Default: auto"),
    output_format: z
      .enum(OUTPUT_FORMATS)
      .optional()
      .describe("Output format. Default: png"),
    resolution: z
      .enum(RESOLUTIONS)
      .default("1K")
      .describe("Resolution. Default: 1K. Use 1K unless the user explicitly requests higher resolution. 2K/4K cost significantly more and are rarely needed."),
    seed: z
      .number()
      .int()
      .optional()
      .describe("Seed for reproducibility"),
    safety_tolerance: z
      .enum(SAFETY_TOLERANCES)
      .optional()
      .describe("Safety tolerance (1=strictest, 6=least strict). Default: 4"),
    enable_web_search: z
      .boolean()
      .optional()
      .describe("Enable web search for latest information. Default: false"),
    thinking_level: z
      .enum(THINKING_LEVELS)
      .default("minimal")
      .describe("Model thinking level. Default: minimal. Use 'minimal' unless the user explicitly requests higher quality reasoning. 'high' is slower and more expensive — only use when the prompt requires complex reasoning or the user asks for it."),
  },
}, async ({ prompt, num_images, aspect_ratio, output_format, resolution, seed, safety_tolerance, enable_web_search, thinking_level }) => {
  try {
    const input: Record<string, unknown> = { prompt };
    if (num_images !== undefined) input.num_images = num_images;
    if (aspect_ratio !== undefined) input.aspect_ratio = aspect_ratio;
    if (output_format !== undefined) input.output_format = output_format;
    input.resolution = resolution;
    if (seed !== undefined) input.seed = seed;
    if (safety_tolerance !== undefined) input.safety_tolerance = safety_tolerance;
    if (enable_web_search !== undefined) input.enable_web_search = enable_web_search;
    input.thinking_level = thinking_level;

    const result = (await fal.subscribe("fal-ai/nano-banana-2", {
      input,
    })) as unknown as FalResult;

    const images = result.data.images;
    const description = result.data.description || "";

    const imageList = images
      .map((img: FalImage, i: number) => `Image ${i + 1}: ${img.url}`)
      .join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `Generated ${images.length} image(s):\n\n${imageList}${description ? `\n\nDescription: ${description}` : ""}`,
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text" as const, text: `Error generating image: ${message}` }],
      isError: true,
    };
  }
});

server.registerTool("edit_image", {
  title: "Edit Image",
  description:
    "Edit or transform images using Nano Banana 2 (Google's image editing model via Fal AI). Provide source image URLs and an editing prompt. Returns edited image URLs.",
  inputSchema: {
    prompt: z
      .string()
      .describe("The prompt describing the desired edit"),
    image_urls: z
      .array(z.string().url())
      .min(1)
      .describe("URLs of source images to edit"),
    num_images: z
      .number()
      .int()
      .min(1)
      .max(4)
      .optional()
      .describe("Number of images to generate (1-4). Default: 1"),
    aspect_ratio: z
      .enum(ASPECT_RATIOS)
      .optional()
      .describe("Aspect ratio. Default: auto"),
    output_format: z
      .enum(OUTPUT_FORMATS)
      .optional()
      .describe("Output format. Default: png"),
    resolution: z
      .enum(RESOLUTIONS)
      .default("1K")
      .describe("Resolution. Default: 1K. Use 1K unless the user explicitly requests higher resolution. 2K/4K cost significantly more and are rarely needed."),
    seed: z
      .number()
      .int()
      .optional()
      .describe("Seed for reproducibility"),
    safety_tolerance: z
      .enum(SAFETY_TOLERANCES)
      .optional()
      .describe("Safety tolerance (1=strictest, 6=least strict). Default: 4"),
    enable_web_search: z
      .boolean()
      .optional()
      .describe("Enable web search for latest information. Default: false"),
    thinking_level: z
      .enum(THINKING_LEVELS)
      .default("minimal")
      .describe("Model thinking level. Default: minimal. Use 'minimal' unless the user explicitly requests higher quality reasoning. 'high' is slower and more expensive — only use when the prompt requires complex reasoning or the user asks for it."),
  },
}, async ({ prompt, image_urls, num_images, aspect_ratio, output_format, resolution, seed, safety_tolerance, enable_web_search, thinking_level }) => {
  try {
    const input: Record<string, unknown> = { prompt, image_urls };
    if (num_images !== undefined) input.num_images = num_images;
    if (aspect_ratio !== undefined) input.aspect_ratio = aspect_ratio;
    if (output_format !== undefined) input.output_format = output_format;
    input.resolution = resolution;
    if (seed !== undefined) input.seed = seed;
    if (safety_tolerance !== undefined) input.safety_tolerance = safety_tolerance;
    if (enable_web_search !== undefined) input.enable_web_search = enable_web_search;
    input.thinking_level = thinking_level;

    const result = (await fal.subscribe("fal-ai/nano-banana-2/edit", {
      input,
    })) as unknown as FalResult;

    const images = result.data.images;
    const description = result.data.description || "";

    const imageList = images
      .map((img: FalImage, i: number) => `Image ${i + 1}: ${img.url}`)
      .join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `Edited ${images.length} image(s):\n\n${imageList}${description ? `\n\nDescription: ${description}` : ""}`,
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text" as const, text: `Error editing image: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("fal-nano-mcp server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
