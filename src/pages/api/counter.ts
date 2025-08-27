// API endpoint for page counter
// Production Edge Config integration

import type { APIRoute } from "astro";
import { get } from "@vercel/edge-config";
import { config } from "dotenv";

// Load environment variables from .env files for local development
config({ path: [".env.local", ".env"] });

// Update Edge Config using Vercel API
async function updateEdgeConfig(key: string, value: number) {
  if (!process.env.VERCEL_API_TOKEN || !process.env.EDGE_CONFIG_ID) {
    throw new Error(
      "Missing required environment variables: VERCEL_API_TOKEN or EDGE_CONFIG_ID"
    );
  }

  const apiUrl = new URL(
    `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`
  );

  // Add team ID if available
  if (process.env.VERCEL_TEAM_ID) {
    apiUrl.searchParams.append("teamId", process.env.VERCEL_TEAM_ID);
  }

  const response = await fetch(apiUrl.toString(), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          operation: "upsert",
          key,
          value,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Edge Config update failed: ${error}`);
  }

  return { success: true };
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "read";

    // Read current count from Edge Config
    const currentCount = Number((await get("page_views")) || 0);

    // For read-only requests (just display the count)
    if (request.method === "GET" && action === "read") {
      return new Response(JSON.stringify({ count: currentCount }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, max-age=60",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Default response
    return new Response(JSON.stringify({ count: currentCount }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Counter error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        count: 0,
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "increment";

    // Read current count from Edge Config
    const currentCount = Number((await get("page_views")) || 0);

    // For increment requests (track page view)
    if (
      request.method === "POST" ||
      (request.method === "GET" && action === "increment")
    ) {
      const newCount = currentCount + 1;

      // Update the count in Edge Config
      const updateResult = await updateEdgeConfig("page_views", newCount);

      // Return the new count
      return new Response(
        JSON.stringify({
          count: newCount,
          success: updateResult.success,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response("Method not allowed", {
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Counter error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        count: 0,
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

// Handle OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
};
