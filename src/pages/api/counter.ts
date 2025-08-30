// API endpoint for page counter
// Neon database integration

import type { APIRoute } from "astro";
import { config } from "dotenv";
import { getPageCount, incrementPageCount } from "../../utils/database.js";

// Load environment variables from .env files for local development
config({ path: [".env.local", ".env"] });

export const GET: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "read";

    // Primary: Read current count from Neon database
    const currentCount = await getPageCount();

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
      const newCount = await incrementPageCount();

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
