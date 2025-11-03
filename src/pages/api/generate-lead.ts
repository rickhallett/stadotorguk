import type { APIRoute } from "astro";
import { createLead, getAllLeads } from "../../utils/database";
import Anthropic from "@anthropic-ai/sdk";

// UK first names for synthetic lead generation
const UK_FIRST_NAMES = [
  "Oliver", "George", "Harry", "Jack", "Jacob", "Noah", "Charlie", "Muhammad",
  "Thomas", "Oscar", "William", "James", "Leo", "Alfie", "Henry", "Joshua",
  "Olivia", "Amelia", "Isla", "Emily", "Poppy", "Ava", "Isabella", "Jessica",
  "Lily", "Sophie", "Grace", "Sophia", "Mia", "Evie", "Ruby", "Ella",
  "Sarah", "Emma", "Laura", "Rachel", "Hannah", "Lucy", "Katie", "Rebecca",
  "John", "David", "Michael", "Paul", "Andrew", "Mark", "Peter", "Richard",
];

const UK_LAST_NAMES = [
  "Smith", "Jones", "Williams", "Taylor", "Brown", "Davies", "Evans", "Wilson",
  "Thomas", "Roberts", "Johnson", "Lewis", "Walker", "Robinson", "Wood",
  "Thompson", "White", "Watson", "Jackson", "Wright", "Green", "Harris",
  "Cooper", "King", "Lee", "Martin", "Clarke", "James", "Morgan", "Hughes",
];

interface RewordingStyle {
  instruction: string;
  temperature: number;
}

const REWORDING_STYLES: RewordingStyle[] = [
  {
    instruction: "Rewrite in a more concise, punchy way. Use short sentences. Remove filler words.",
    temperature: 0.85,
  },
  {
    instruction: "Rewrite with more emotional intensity. Add frustration or urgency without changing the core message.",
    temperature: 0.88,
  },
  {
    instruction: "Rewrite in a calmer, more measured tone. Make it more factual and less emotional.",
    temperature: 0.82,
  },
  {
    instruction: "Rewrite as if written by an elderly person - simpler language, nostalgic references, weary tone.",
    temperature: 0.8,
  },
  {
    instruction: "Rewrite with dry British sarcasm. Keep the complaint but add subtle humor.",
    temperature: 0.92,
  },
  {
    instruction: "Rewrite focusing on personal impact. Use 'I' and 'my' to make it more individual.",
    temperature: 0.87,
  },
  {
    instruction: "Rewrite as a brief observation. State facts matter-of-factly without elaboration.",
    temperature: 0.9,
  },
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "outlook.com", "yahoo.co.uk", "hotmail.co.uk", "btinternet.com"];
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 999)}`,
  ];
  return `${getRandomElement(formats)}@${getRandomElement(domains)}`;
}

async function rewordComment(originalComment: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || (import.meta as any)?.env?.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not found");
  }

  const anthropic = new Anthropic({ apiKey });
  const style = getRandomElement(REWORDING_STYLES);

  const prompt = `You are helping create varied community feedback for a traffic activism website.

ORIGINAL COMMENT:
"${originalComment}"

TASK: ${style.instruction}

REQUIREMENTS:
- Keep the same core concern/complaint
- Use completely different words and phrasing
- Maintain natural, authentic voice
- Length can vary (40-300 characters is fine)
- Do NOT use quotes around your response
- Respond with ONLY the reworded comment, nothing else

Reworded comment:`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 200,
    temperature: style.temperature,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  let reworded = content.text.trim().replace(/^["']|["']$/g, "");

  // Enforce 300 char max
  if (reworded.length > 300) {
    reworded = reworded.slice(0, 300).trim();
    const lastSpace = reworded.lastIndexOf(" ");
    if (lastSpace > 240) {
      reworded = reworded.slice(0, lastSpace);
    }
  }

  return reworded;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization");
    const adminSecret = import.meta.env.ADMIN_SECRET || process.env.ADMIN_SECRET;
    const expectedToken = `Bearer ${adminSecret}`;

    if (authHeader !== expectedToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("🎲 Fetching existing comments from database...");

    // Get all leads with comments (real human submissions only, exclude synthetic)
    const allLeads = await getAllLeads();
    const realComments = allLeads.filter(
      (lead) => lead.comments && lead.comments.trim() !== "" && lead.source !== "synthetic"
    );

    if (realComments.length < 10) {
      console.error("❌ Not enough real comments in database (need at least 10)");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Insufficient real comments for rewording",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pick a random real comment to reword
    const sourceComment = getRandomElement(realComments);
    console.log(`📝 Selected comment to reword: "${sourceComment.comments!.slice(0, 60)}..."`);

    // Reword the comment
    console.log("🧠 Rewording with Claude Haiku 4.5...");
    const rewordedComment = await rewordComment(sourceComment.comments!);

    // Generate synthetic lead metadata
    const firstName = getRandomElement(UK_FIRST_NAMES);
    const lastName = getRandomElement(UK_LAST_NAMES);
    const email = generateEmail(firstName, lastName);
    const visitorTypes: Array<"Local" | "Visitor" | "Tourist" | "Other"> = ["Local", "Visitor", "Tourist", "Other"];
    const visitorType = getRandomElement(visitorTypes);

    console.log(`✅ Reworded: "${rewordedComment}"`);
    console.log(`👤 Creating lead: ${firstName} ${lastName} (${visitorType})`);

    // Create lead in database with reworded comment
    const leadId = await createLead({
      timestamp: new Date(),
      user_id: `synthetic_${Date.now()}`,
      submission_id: `synthetic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      first_name: firstName,
      last_name: lastName,
      name: `${firstName} ${lastName}`,
      email: email,
      visitor_type: visitorType,
      comments: rewordedComment,
      source: "synthetic",
      published: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        leadId,
        lead: {
          name: `${firstName} ${lastName}`,
          type: visitorType,
          commentLength: rewordedComment.length,
          original: sourceComment.comments!.slice(0, 80),
          reworded: rewordedComment.slice(0, 80),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("API Error generating reworded lead:", error);
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
