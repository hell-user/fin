import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialize Gemini client to prevent startup failure if API key is not defined yet
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// REST Web API Endpoint: Generate AI Personal Finance Analysis
app.post("/api/ai/insights", async (req, res) => {
  try {
    const { incomes = [], onlineTransactions = [], offlineExpenses = [], budgets = [], savingsGoals = [], currentMonth = "2026-05" } = req.body;

    const client = getGeminiClient();
    
    // Fallback response in case GEMINI_API_KEY is not defined, providing a fully functional pre-compiled trial
    if (!client) {
      return res.json({
        isMock: true,
        summary: "Notice: To activate real-time Gemini AI analysis, configure your **GEMINI_API_KEY** in the AI Studio Secrets tab! Showing sample pre-calculated insights module:\n\nYour general cash velocity is in a strong safe zone, with a 38.4% monthly savings rate. Online UPI and credit purchases account for 78% of your overall monthly outgo, whereas offline cash accounts for 22%. Your most heavily loaded categories are Education and Food. You have successfully stayed inside your cumulative budget, but we detected category limits stress on Food.",
        habits: [
          "Healthy Habit: Your total income ($5,350) far exceeds your total monthly spending ($2,133), leaving a comfortable, clean surplus for additional savings goals.",
          "UPI Velocity: You make frequent, small-to-medium digital UPI transfers for Food. While fast, small food purchases often aggregate into a substantial slice of your monthly outgo.",
          "Cash Liquidity: Your cash expenses are localized to natural Farmers Markets and Subway transits, suggesting disciplined physical cash management."
        ],
        savingsSuggestions: [
          "Emergency Fund Acceleration: Dedicate $400 of this month's $3,217 surplus explicitly into your 'Emergency Nest-Egg Shield' to speed up your deadline completion.",
          "Food Consolidation: Consolidate smaller dining deliveries. Preparing ingredients bought at farmers markets can trim Zomato/dining outgo by up to 25% ($100 saved).",
          "Automate Subscriptions Audit: Review your active entertainment subscriptions. If you have unused premium services, pausing them will immediately recover liquid yield."
        ],
        budgetRecommendations: [
          "Revise Food Limits: Increase your Food category limit slightly from $400 to $450, while adjusting Shopping down from $500 to $400 to match your actual historical patterns accurately.",
          "Buffer Travel Allowance: Allocate a minor physical cash travel buffer of $50 for public transit emergencies."
        ],
        patternDetection: [
          "Weekend Spike: Your dining-out expenses occur mostly on Saturdays and Sundays. Digital food orders are 4x higher on weekends than weekdays.",
          "Mid-Month Education: Large, self-investment purchases occur in the second week of the month, indicating planned, conscious expenditures rather than impulsive outlays."
        ]
      });
    }

    // Build optimized prompts for Gemini
    const incomeSummary = incomes.map((i: any) => `- $${i.amount} from '${i.source}' (Date: ${i.date}, Recurring: ${i.recurring ? 'Yes' : 'No'})`).join("\n");
    const onlineSummary = onlineTransactions.map((t: any) => `- $${t.amount} for '${t.category}' at '${t.merchantName}' using ${t.paymentMethod} (Date: ${t.dateTime})`).join("\n");
    const offlineSummary = offlineExpenses.map((t: any) => `- $${t.amount} for '${t.category}' at '${t.placeName}' with Cash (Date: ${t.date})`).join("\n");
    const goalsSummary = savingsGoals.map((g: any) => `- Goal '${g.name}': Target $${g.targetAmount}, Current Saved $${g.currentAmount} (Deadline: ${g.deadline})`).join("\n");

    const activeBudget = budgets.find((b: any) => b.month === currentMonth) || { limitAmount: 3000, categoryLimits: {} };
    const budgetLimitsSummary = `Overall limit: $${activeBudget.limitAmount}. Category allocations: ${JSON.stringify(activeBudget.categoryLimits)}`;

    const prompt = `You are a professional AI Financial Advisor. Analyze the user's financial profile for the month ${currentMonth} and provide smart, actionable, and personalized insights in JSON format.
    
Here is the user's financial log:

1. INCOME ENTRIES:
${incomeSummary || "No income reported."}

2. ONLINE TRANSACTIONS:
${onlineSummary || "No online transactions reported."}

3. OFFLINE CASH EXPENSES:
${offlineSummary || "No offline cash expenses reported."}

4. ACTIVE BUDGET TARGETS:
${budgetLimitsSummary}

5. ACTIVE SAVINGS GOALS:
${goalsSummary || "No active savings goals."}

Please analyze this data and return a JSON object with strictly defined structure.
DO NOT wrap the JSON in Markdown backticks except as raw text. Ensure the JSON parsed successfully without syntax errors.

Schema of the expected JSON response:
\`\`\`json
{
  "summary": "String synthesizing their overall month (financial health, cash flow, Ratios, safe spending status). Use realistic percentages.",
  "habits": ["List of 3 concrete habit observations, highlighting achievements and areas of concern"],
  "savingsSuggestions": ["List of 3 clear, custom, highly actionable recommendations on how to save more cash effectively based on their categories data"],
  "budgetRecommendations": ["List of 2-3 precise recommended adjustments to their monthly or category budgets based on actual overspending trends"],
  "patternDetection": ["List of 2-3 interesting spending pattern detections (e.g., weekend spending spikes, recurring vs non-recurring balances, cash vs digital volume comparison)"]
}
\`\`\`
Ensure all numbers are realistic and directly correlate to the provided amounts. Keep advice professional, constructive, and highly valuable.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            habits: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            savingsSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            budgetRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            patternDetection: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "habits", "savingsSuggestions", "budgetRecommendations", "patternDetection"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty text output from Gemini");
    }

    const insights = JSON.parse(textOutput.trim());
    res.json({ ...insights, isMock: false });

  } catch (error: any) {
    console.error("Error generating Gemini AI insights:", error);
    res.status(500).json({ error: "Failed to generate AI financial insights.", details: error.message });
  }
});

// Serve frontend assets in Dev / Production environments
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Web server started successfully in ${process.env.NODE_ENV || 'development'} mode on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
