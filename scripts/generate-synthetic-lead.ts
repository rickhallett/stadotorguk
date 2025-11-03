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
  threshold: number = 35
): { unique: boolean; maxSimilarity: number; closestMatch?: string } {
  // Only check against recent leads (windowed approach) to reduce collision probability
  const recentLeads = existingLeads.slice(-150);

  let maxSimilarity = 0;
  let closestMatch: string | undefined;

  for (const lead of recentLeads) {
    if (!lead.comments) continue;

    const similarity = calculateNGramSimilarity(newComment, lead.comments);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      closestMatch = lead.comments;
    }

    if (similarity > threshold) {
      console.log(
        `   ❌ REJECTION: ${similarity.toFixed(1)}% similar to: "${lead.comments.slice(0, 60)}..."`
      );
      console.log(`   📝 Generated: "${newComment.slice(0, 60)}..."`);
      return { unique: false, maxSimilarity: similarity, closestMatch: lead.comments };
    }
  }

  console.log(`   ✅ PASSED: Max similarity ${maxSimilarity.toFixed(1)}% (threshold: ${threshold}%)`);
  return { unique: true, maxSimilarity, closestMatch };
}

interface CommentStyle {
  persona: string;
  tone: string;
  styleGuide: string;
  temperature: number;
}

function getRandomCommentStyle(): CommentStyle {
  const styles: CommentStyle[] = [
    {
      persona: "frustrated local resident",
      tone: "exasperated, direct, lived experience",
      styleGuide: "Short sentences. Personal impact. Raw emotion. Use 'I' and 'we'.",
      temperature: 0.85,
    },
    {
      persona: "concerned visitor",
      tone: "disappointed, comparative, observational",
      styleGuide: "Compare to other places. Express sadness about change. Use 'used to' and 'now'.",
      temperature: 0.9,
    },
    {
      persona: "business owner",
      tone: "economic focus, practical, frustrated",
      styleGuide: "Mention business impact. Lost customers. Practical concerns. Use numbers/specifics.",
      temperature: 0.8,
    },
    {
      persona: "parent/safety advocate",
      tone: "worried, protective, specific incidents",
      styleGuide: "Focus on children, safety, near-misses. Use emotional language about risk.",
      temperature: 0.88,
    },
    {
      persona: "elderly resident",
      tone: "nostalgic, comparative to past, weary",
      styleGuide: "Reference 'years ago'. Slower pace. Simpler language. Resignation mixed with anger.",
      temperature: 0.82,
    },
    {
      persona: "environmental advocate",
      tone: "systemic critique, data-aware, urgent",
      styleGuide: "Mention emissions, air quality, sustainability. Use terms like 'unsustainable'.",
      temperature: 0.92,
    },
    {
      persona: "casual observer",
      tone: "matter-of-fact, brief, obvious frustration",
      styleGuide: "State the obvious. Minimal elaboration. Dry humor or sarcasm welcome.",
      temperature: 0.95,
    },
    {
      persona: "tourist",
      tone: "shocked, comparing expectations vs reality",
      styleGuide: "Expected peaceful village, got traffic. Vacation ruined. Disappointed tone.",
      temperature: 0.87,
    },
  ];

  return getRandomElement(styles);
}

function getRandomCommentLength(): { min: number; max: number; tokens: number } {
  // Weighted distribution favoring shorter comments (40-300 chars) to simulate effort levels
  const rand = Math.random();

  if (rand < 0.50) {
    // 50% chance: minimal effort (40-80 chars) - quick reaction
    return { min: 40, max: 80, tokens: 50 };
  } else if (rand < 0.80) {
    // 30% chance: moderate effort (80-150 chars) - brief concern
    return { min: 80, max: 150, tokens: 100 };
  } else if (rand < 0.95) {
    // 15% chance: higher effort (150-220 chars) - detailed feedback
    return { min: 150, max: 220, tokens: 150 };
  } else {
    // 5% chance: maximum effort (220-300 chars) - comprehensive statement
    return { min: 220, max: 300, tokens: 200 };
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
        `${idx + 1}. "${lead.comments}" (${lead.visitor_type || "Local"}, ${lead.comments!.length} chars)`
    )
    .join("\n");

  // Get random target length and style for this comment
  const lengthTarget = getRandomCommentLength();
  const style = getRandomCommentStyle();

  const prompt = `You are helping generate realistic community feedback for the Swanage Traffic Alliance website - a local activism group concerned about traffic congestion in Swanage, Dorset, UK.

Here are some recent REAL comments from community members (with character counts):

${exampleComments}

PERSONA: Write as a ${style.persona}
TONE: ${style.tone}
STYLE GUIDE: ${style.styleGuide}

Generate ONE new comment that:
- Expresses concerns about traffic, congestion, tourism impacts, safety, or quality of life
- Uses COMPLETELY DIFFERENT words and phrasing from examples (must be lexically unique, <35% word overlap)
- Sounds natural and authentic to your assigned persona
- Is ${lengthTarget.min}-${lengthTarget.max} characters long (important: match this range)
- Reflects the emotional state and perspective of your persona
- Follows your specific style guide above

CRITICAL UNIQUENESS REQUIREMENTS:
- Do NOT copy phrases or sentence structures from the examples
- Create entirely new wording while maintaining thematic relevance
- Respect the character count target (${lengthTarget.min}-${lengthTarget.max} characters)
- Use different vocabulary - if examples say "gridlock", use alternatives like "standstill", "crawling", "bottlenecked", "jammed", "chaos"
- Vary sentence structure based on persona (some use fragments, some full sentences, some questions)
- Inject personality quirks: some people repeat words, some use ellipses, some use exclamation marks, some are measured

Respond with ONLY the comment text, no quotes, no preamble, no explanation.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: lengthTarget.tokens,
    temperature: style.temperature,
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

  let comment = content.text.trim().replace(/^["']|["']$/g, "");

  // Enforce character limit by truncating if necessary
  if (comment.length > lengthTarget.max) {
    comment = comment.slice(0, lengthTarget.max).trim();
    // Try to end at a word boundary
    const lastSpace = comment.lastIndexOf(" ");
    if (lastSpace > lengthTarget.max * 0.8) {
      comment = comment.slice(0, lastSpace);
    }
  }

  return comment;
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
    const maxAttempts = 5;
    const attemptResults: Array<{ attempt: number; similarity: number; comment: string }> = [];

    do {
      attempts++;
      console.log(`\n   🎯 Attempt ${attempts}/${maxAttempts}...`);

      // Re-select random samples each attempt for fresh context
      const freshSample = selectRandomLeads(leadsWithComments, sampleSize);
      comment = await generateCommentWithLLM(freshSample);

      const uniqueCheck = isCommentUnique(comment, leadsWithComments);
      attemptResults.push({
        attempt: attempts,
        similarity: uniqueCheck.maxSimilarity,
        comment: comment.slice(0, 80),
      });

      if (uniqueCheck.unique) {
        console.log(`\n✅ SUCCESS after ${attempts} attempt(s)`);
        console.log(`   Final comment: "${comment}"`);
        console.log(`   Length: ${comment.length} chars`);
        break;
      }

      if (attempts >= maxAttempts) {
        console.log(`\n❌ FAILURE: Could not generate unique comment after ${maxAttempts} attempts`);
        console.log(`\n📊 Attempt Summary:`);
        attemptResults.forEach((result) => {
          console.log(`   ${result.attempt}. Similarity: ${result.similarity.toFixed(1)}% - "${result.comment}..."`);
        });
        console.log(`\n💡 Diagnostic: All attempts exceeded 35% similarity threshold`);
        console.log(`   Database has ${leadsWithComments.length} leads (checking last 150)`);
        return null;
      }

      console.log(`   🔄 Retrying with fresh random samples...`);
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
