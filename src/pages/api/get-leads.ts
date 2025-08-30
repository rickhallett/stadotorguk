import type { APIRoute } from "astro";
import { getLeads } from "../../utils/database";

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");

  const leads = await getLeads(limit, offset);

  return new Response(JSON.stringify(leads), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
