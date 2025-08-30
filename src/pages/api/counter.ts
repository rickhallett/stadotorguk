// API endpoint for page counter
// Neon database integration with Edge Config fallback

import type { APIRoute } from "astro";
import { get } from "@vercel/edge-config";
import { config } from "dotenv";
import { getPageCount, incrementPageCount } from "../../utils/database.js";

// Load environment variables from .env files for local development
config({ path: [".env.local", ".env"] });

// Fallback: Update Edge Config using Vercel API (for legacy support)
async function updateEdgeConfig(key: string, value: number) {
  if (!process.env.VERCEL_API_TOKEN || !process.env.EDGE_CONFIG_ID) {
    console.warn("Edge Config not configured, skipping fallback update");
    return { success: false };
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

    // Primary: Read current count from Neon database
    let currentCount: number;
    try {
      currentCount = await getPageCount();
    } catch (dbError) {
      console.error("Database read failed, trying Edge Config fallback:", dbError);
      // Fallback to Edge Config if database fails
      currentCount = Number((await get("page_views")) || 0);
    }

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

    // For increment requests (track page view)
    if (
      request.method === "POST" ||
      (request.method === "GET" && action === "increment")
    ) {
      // Primary: Increment count in Neon database
      let newCount: number;
      try {
        newCount = await incrementPageCount();
      } catch (dbError) {
        console.error("Database increment failed, trying Edge Config fallback:", dbError);
        
        // Fallback: Read current count and increment in Edge Config
        const currentCount = Number((await get("page_views")) || 0);
        newCount = currentCount + 1;
        await updateEdgeConfig("page_views", newCount);
      }

      // Optional: Keep Edge Config in sync (fire-and-forget)
      try {
        await updateEdgeConfig("page_views", newCount);
      } catch (edgeError) {
        console.warn("Edge Config sync failed (non-critical):", edgeError);
      }

      // Return the new count
      return new Response(
        JSON.stringify({
          count: newCount,
          success: true,
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
