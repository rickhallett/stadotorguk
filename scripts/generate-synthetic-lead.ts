import { config } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { getAllLeads, type Lead } from "../src/utils/database";

config({ path: [".env.local", ".env"] });

interface SyntheticLead {
  firstName: string;
  lastName: string;
  email: string;
  visitorType: "Local" | "Visitor" | "Tourist" | "Other";
  comment: string;
}

// UK first names weighted by popularity
const UK_FIRST_NAMES = [
  "Oliver",
  "George",
  "Harry",
  "Jack",
  "Jacob",
  "Noah",
  "Charlie",
  "Muhammad",
  "Thomas",
  "Oscar",
  "William",
  "James",
  "Leo",
  "Alfie",
  "Henry",
  "Joshua",
  "Olivia",
  "Amelia",
  "Isla",
  "Emily",
  "Poppy",
  "Ava",
  "Isabella",
  "Jessica",
  "Lily",
  "Sophie",
  "Grace",
  "Sophia",
  "Mia",
  "Evie",
  "Ruby",
  "Ella",
  "Sarah",
  "Emma",
  "Laura",
  "Rachel",
  "Hannah",
  "Lucy",
  "Katie",
  "Rebecca",
  "John",
  "David",
  "Michael",
  "Paul",
  "Andrew",
  "Mark",
  "Peter",
  "Richard",
];

const UK_LAST_NAMES = [
  "Smith",
  "Jones",
  "Williams",
  "Taylor",
  "Brown",
  "Davies",
  "Evans",
  "Wilson",
  "Thomas",
  "Roberts",
  "Johnson",
  "Lewis",
  "Walker",
  "Robinson",
  "Wood",
  "Thompson",
  "White",
  "Watson",
  "Jackson",
  "Wright",
  "Green",
  "Harris",
  "Cooper",
  "King",
  "Lee",
  "Martin",
  "Clarke",
  "James",
  "Morgan",
  "Hughes",
  "Edwards",
  "Hill",
  "Moore",
  "Clark",
  "Harrison",
  "Scott",
  "Young",
  "Morris",
  "Hall",
  "Ward",
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = [
    "gmail.com",
    "outlook.com",
    "yahoo.co.uk",
    "hotmail.co.uk",
    "btinternet.com",
  ];
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 999)}`,
  ];

  return `${getRandomElement(formats)}@${getRandomElement(domains)}`;
}

function selectRandomLeads(leads: Lead[], count: number = 3): Lead[] {
  const shuffled = [...leads].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, leads.length));
}

function calculateNGramSimilarity(
  text1: string,
  text2: string,
  n: number = 3
): number {
  const getNGrams = (text: string): Set<string> => {
    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    const ngrams = new Set<string>();
    for (let i = 0; i <= normalized.length - n; i++) {
      ngrams.add(normalized.slice(i, i + n));
    }
    return ngrams;
  };

  const ngrams1 = getNGrams(text1);
  const ngrams2 = getNGrams(text2);

  const intersection = new Set([...ngrams1].filter((x) => ngrams2.has(x)));
  const union = new Set([...ngrams1, ...ngrams2]);

  return union.size === 0 ? 0 : (intersection.size / union.size) * 100;
}

function isCommentUnique(
  newComment: string,
  existingLeads: Lead[],
  threshold: number = 25
): boolean {
  for (const lead of existingLeads) {
    if (!lead.comments) continue;

    const similarity = calculateNGramSimilarity(newComment, lead.comments);
    if (similarity > threshold) {
      console.log(
        `❌ Comment too similar (${similarity.toFixed(
          1
        )}%) to existing: "${lead.comments.slice(0, 50)}..."`
      );
      return false;
    }
  }
  return true;
}

function getRandomCommentLength(): { min: number; max: number; tokens: number } {
  // Weighted distribution heavily favoring shorter comments for better uniqueness
  const rand = Math.random();

  if (rand < 0.6) {
    // 60% chance: short comment (10-40 words) - easiest to make unique
    return { min: 10, max: 40, tokens: 80 };
  } else if (rand < 0.85) {
    // 25% chance: medium comment (40-80 words) - moderate uniqueness
    return { min: 40, max: 80, tokens: 180 };
  } else if (rand < 0.95) {
    // 10% chance: long comment (80-120 words) - harder to be unique
    return { min: 80, max: 120, tokens: 250 };
  } else {
    // 5% chance: very long comment (120-150 words) - hardest to be unique
    return { min: 120, max: 150, tokens: 320 };
  }
}

async function generateCommentWithLLM(sampleLeads: Lead[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not found in environment variables");
  }

  const anthropic = new Anthropic({ apiKey });

  const exampleComments = sampleLeads
    .filter((lead) => lead.comments)
    .map(
      (lead, idx) =>
        `${idx + 1}. "${lead.comments}" (${lead.visitor_type || "Local"}, ${lead.comments!.split(' ').length} words)`
    )
    .join("\n");

  // Get random target length for this comment
  const lengthTarget = getRandomCommentLength();

  const prompt = `You are helping generate realistic community feedback for the Swanage Traffic Alliance website - a local activism group concerned about traffic congestion in Swanage, Dorset, UK.

Here are some recent REAL comments from community members (with word counts):

${exampleComments}

Generate ONE new comment that:
- Expresses similar concerns (traffic, congestion, tourism impacts, safety, quality of life)
- Uses COMPLETELY DIFFERENT words and phrasing (must be lexically unique, <25% word overlap)
- Sounds natural and authentic like a real resident or visitor
- Is ${lengthTarget.min}-${lengthTarget.max} words long (important: match this range)
- Reflects genuine frustration or concern about traffic issues
- Matches the tone and style of real community feedback
- Varies in detail level: short comments are punchy, long comments include specific examples and reasoning
- Uses varied vocabulary, sentence structures, and perspectives to maximize uniqueness

CRITICAL:
- Do NOT copy phrases or sentence structures from the examples
- Create entirely new wording while maintaining thematic relevance
- Respect the word count target (${lengthTarget.min}-${lengthTarget.max} words)
- Use different vocabulary choices - if examples say "gridlock", use alternatives like "standstill", "crawling", "bottlenecked"
- Vary sentence structure - mix short punchy sentences with longer flowing ones

Respond with ONLY the comment text, no quotes, no preamble, no explanation.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: lengthTarget.tokens,
    temperature: 0.9,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return content.text.trim().replace(/^["']|["']$/g, "");
}

export async function generateSyntheticLead(
  dryRun: boolean = true
): Promise<SyntheticLead | null> {
  try {
    console.log("\n🤖 Starting synthetic lead generation...\n");

    // Fetch all existing leads
    console.log("📥 Fetching existing leads from database...");
    const allLeads = await getAllLeads();
    const leadsWithComments = allLeads.filter(
      (lead) => lead.comments && lead.comments.trim() !== ""
    );
    console.log(`✅ Found ${leadsWithComments.length} leads with comments\n`);

    if (leadsWithComments.length < 3) {
      console.log(
        "❌ Not enough existing comments to generate from (need at least 3)"
      );
      return null;
    }

    // Select random sample
    const sampleSize = Math.min(
      5,
      Math.max(3, Math.floor(leadsWithComments.length * 0.1))
    );
    const selectedLeads = selectRandomLeads(leadsWithComments, sampleSize);
    console.log(
      `🎲 Selected ${selectedLeads.length} random leads as examples:\n`
    );
    selectedLeads.forEach((lead, idx) => {
      console.log(
        `   ${idx + 1}. ${lead.first_name} (${
          lead.visitor_type
        }): "${lead.comments?.slice(0, 60)}..."`
      );
    });

    // Generate comment with LLM
    console.log("\n🧠 Generating unique comment with Claude Haiku 4.5...");
    let comment: string;
    let attempts = 0;
    const maxAttempts = 3;

    do {
      attempts++;
      console.log(`   Attempt ${attempts}/${maxAttempts}...`);
      comment = await generateCommentWithLLM(selectedLeads);

      if (isCommentUnique(comment, leadsWithComments)) {
        console.log(`✅ Generated unique comment (${comment.length} chars)`);
        break;
      }

      if (attempts >= maxAttempts) {
        console.log(
          `❌ Failed to generate unique comment after ${maxAttempts} attempts`
        );
        return null;
      }

      console.log(`   Retrying with higher temperature...`);
    } while (attempts < maxAttempts);

    // Generate realistic metadata
    const firstName = getRandomElement(UK_FIRST_NAMES);
    const lastName = getRandomElement(UK_LAST_NAMES);
    const email = generateEmail(firstName, lastName);

    // Match visitor type distribution from existing leads
    const typeDistribution = leadsWithComments.reduce((acc, lead) => {
      const type = lead.visitor_type || "Local";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const types = Object.entries(typeDistribution);
    const totalWeight = types.reduce((sum, [, count]) => sum + count, 0);
    const random = Math.random() * totalWeight;
    let cumulative = 0;
    let visitorType: "Local" | "Visitor" | "Tourist" | "Other" = "Local";

    for (const [type, count] of types) {
      cumulative += count;
      if (random <= cumulative) {
        visitorType = type as "Local" | "Visitor" | "Tourist" | "Other";
        break;
      }
    }

    const syntheticLead: SyntheticLead = {
      firstName,
      lastName,
      email,
      visitorType,
      comment,
    };

    const wordCount = syntheticLead.comment.split(/\s+/).length;

    console.log("\n✨ Generated Synthetic Lead:");
    console.log(
      `   Name: ${syntheticLead.firstName} ${syntheticLead.lastName}`
    );
    console.log(`   Email: ${syntheticLead.email}`);
    console.log(`   Type: ${syntheticLead.visitorType}`);
    console.log(`   Comment: "${syntheticLead.comment}"`);
    console.log(`   Length: ${wordCount} words (${syntheticLead.comment.length} chars)`);

    if (dryRun) {
      console.log("\n🔒 DRY RUN MODE - No database changes made");
    }

    return syntheticLead;
  } catch (error) {
    console.error("\n❌ Error generating synthetic lead:", error);
    throw error;
  }
}

// Run standalone if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSyntheticLead(false)
    .then((result) => {
      if (result) {
        console.log("\n✅ Generation test completed successfully");
        process.exit(0);
      } else {
        console.log("\n⚠️  Generation returned no result");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n💥 Generation failed:", error);
      process.exit(1);
    });
}
