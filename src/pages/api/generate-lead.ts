import type { APIRoute } from "astro";
import { generateSyntheticLead } from "../../../scripts/generate-synthetic-lead";
import { createLead } from "../../utils/database";

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization");
    const adminSecret = import.meta.env.ADMIN_SECRET || process.env.ADMIN_SECRET;
    const expectedToken = `Bearer ${adminSecret}`;

    // Debug logging (remove after fixing)
    const debugInfo = {
      hasAuthHeader: !!authHeader,
      hasAdminSecret: !!adminSecret,
      authHeaderLength: authHeader?.length,
      expectedTokenLength: expectedToken.length,
      authHeaderPrefix: authHeader?.slice(0, 20),
      expectedTokenPrefix: expectedToken.slice(0, 20),
      match: authHeader === expectedToken,
      envKeys: Object.keys(import.meta.env).filter(k => k.includes('ADMIN') || k.includes('SECRET')),
      processEnvKeys: Object.keys(process.env).filter(k => k.includes('ADMIN') || k.includes('SECRET'))
    };
    console.log("Auth Debug:", JSON.stringify(debugInfo, null, 2));

    if (authHeader !== expectedToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
          debug: debugInfo // Include debug in response temporarily
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate synthetic lead (not dry run)
    const syntheticLead = await generateSyntheticLead(false);

    if (!syntheticLead) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to generate unique lead",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create lead in database
    const leadId = await createLead({
      timestamp: new Date(),
      user_id: `synthetic_${Date.now()}`,
      submission_id: `synthetic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      first_name: syntheticLead.firstName,
      last_name: syntheticLead.lastName,
      name: `${syntheticLead.firstName} ${syntheticLead.lastName}`,
      email: syntheticLead.email,
      visitor_type: syntheticLead.visitorType,
      comments: syntheticLead.comment,
      source: "synthetic",
      published: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        leadId,
        lead: {
          name: `${syntheticLead.firstName} ${syntheticLead.lastName}`,
          type: syntheticLead.visitorType,
          commentLength: syntheticLead.comment.length,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("API Error generating lead:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
