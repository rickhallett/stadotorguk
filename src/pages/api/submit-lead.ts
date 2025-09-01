// API endpoint for sign-up form lead submission
// Creates lead entries in Neon database with GitHub backup

import type { APIRoute } from "astro";
import { randomBytes } from "crypto";
import { config } from "dotenv";

import {
  createLead,
  getLeadByEmail,
  type LeadData,
} from "../../utils/database.js";

// Load environment variables from .env files for local development
config({ path: [".env.local", ".env"] });

// Helper function to determine visitor type based on postcode
function determineVisitorType(postcode: string): string {
  if (!postcode) return "Other";

  const localPostcodes = ["BH19", "BH20", "DT11"]; // Swanage area codes
  const prefix = postcode.toUpperCase().substring(0, 4);

  if (localPostcodes.includes(prefix)) {
    return "Local";
  } else if (postcode.startsWith("BH") || postcode.startsWith("DT")) {
    return "Visitor"; // Wider Dorset area
  } else {
    return "Other";
  }
}

// Handle form submission
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.email || !data.first_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Check for existing email
    const existingLead = await getLeadByEmail(data.email);
    if (existingLead) {
      return new Response(
        JSON.stringify({
          error: "This email address has already been registered.",
        }),
        {
          status: 409, // Conflict
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Generate unique IDs
    const timestamp = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 16);
    const submission_id = "sub_" + randomBytes(6).toString("hex");
    const user_id = "usr_" + randomBytes(6).toString("hex");

    // Determine visitor type from postcode
    const visitor_type = determineVisitorType(data.postcode);

    // Prepare lead data for database
    const leadData: LeadData = {
      timestamp: timestamp,
      user_id: user_id,
      submission_id: submission_id,
      first_name: data.first_name,
      last_name: data.last_name || "",
      name: `${data.first_name} ${data.last_name || ""}`,
      email: data.email,
      visitor_type: visitor_type as "Local" | "Visitor" | "Tourist" | "Other",
      comments: data.comments || "",
      referral_code: "",
      source: "signup_form",
      published: true,
    };

    // Primary: Save to Neon database
    try {
      await createLead(leadData);
    } catch (dbError: any) {
      console.error("Database save failed:", dbError);
      return new Response(
        JSON.stringify({
          error: "Failed to save submission to database",
          details: dbError.message,
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

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        submission_id,
        message: "Thank you for joining the alliance!",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error processing submission:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
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

// Handle OPTIONS for CORS preflight requests
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
};
