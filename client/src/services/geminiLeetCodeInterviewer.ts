/**
 * Gemini-Powered Intelligent LeetCode Coding Interviewer & Mentor Service
 * Acts like ChatGPT/Claude as an empathetic, Socratic, technical interview guide.
 *
 * It reads:
 * 1. The exact LeetCode problem (Title, Category, Constraints, Examples, Hints, Complexities)
 * 2. The candidate's live code in the Monaco Editor & selected language
 * 3. The full conversation history
 * 4. Runtime errors, test case results, and tracebacks
 */

import { getGeminiApiKey } from './geminiVoiceService';
import type {
  CodingProblem,
  ExecutionResult,
  InterviewMood,
  InterviewState,
  Message,
  PersonaType,
  SupportedLanguage,
  TestCaseResult
} from '../types';

export interface LeetCodeAgentOutput {
  text: string;
  caption: string;
  mood: InterviewMood;
  nextState?: InterviewState;
}

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite-preview';

/**
 * Builds the system instructions for the AI Interviewer persona.
 */
function buildSystemInstruction(persona: PersonaType, problem: CodingProblem): string {
  const personaBio =
    persona === 'mentor'
      ? `You are Sarah Chen, Staff Software Engineer at MockMaster. You are a warm, encouraging, and highly skilled mentor conducting a technical coding interview. Your goal is to guide the candidate socratically, help them think through algorithms, empathize when they find it hard, and guide them step-by-step toward the optimal solution without simply dumping the complete answer at once.`
      : `You are Marcus Vance, Principal Engineer and Bar Raiser at MockMaster. You are sharp, analytical, rigorous, and direct. You care deeply about edge cases, time/space complexity trade-offs, and clean invariants. While formal and demanding, you are professional and constructive.`;

  return `${personaBio}

CURRENT LEETCODE PROBLEM CONTEXT:
- Problem: "${problem.title}" (${problem.difficulty} - Category: ${problem.category})
- Acceptance Rate: ${problem.acceptanceRate}
- Target Time Complexity: ${problem.optimalTimeComplexity}
- Target Space Complexity: ${problem.optimalSpaceComplexity}
- Description:
${problem.description}

- Constraints:
${problem.constraints.map(c => `  * ${c}`).join('\n')}

- Examples:
${problem.examples.map(ex => `  * Input: ${ex.input} | Output: ${ex.output}${ex.explanation ? ` (Note: ${ex.explanation})` : ''}`).join('\n')}

- Official Progressive Hints:
${problem.hints.map((h, i) => `  ${i + 1}. ${h}`).join('\n')}

CORE INTERVIEWING PRINCIPLES:
1. TALK LIKE A REAL SENIOR ENGINEER / CHATGPT:
   - Be conversational, thoughtful, and natural.
   - When the user asks "how do i approach this?" or "can you tell me how i approach this?", explain the problem intuition, compare brute-force vs optimal approaches (e.g., Hash Map, Two Pointers, Dynamic Programming), and ask what they think.
   - When the user says "its hard", "i am stuck", or "i dont know", show genuine empathy and break down the problem using a tiny concrete example (e.g. 2-3 numbers or a toy input) to guide them step-by-step.
   - When the user shares code or an idea, reference their actual code and validate their logic or point out subtle bugs.
   - If the candidate speaks or types in Hebrew (e.g. "איך פותרים את זה?", "קשה לי"), reply in natural, fluent Hebrew! Otherwise, reply in English.
2. DO NOT DUMP FULL CODE IMMEDIATELY:
   - Provide high-level intuition, pseudo-steps, or small syntax hints. Let them write the code in their editor, but if they are completely lost or explicitly ask for an example, provide a small explanatory snippet.
3. KEEP REPLIES CONCISE & READABLE:
   - Between 2 to 5 sentences or short formatted bullet points. Avoid massive walls of text that would overwhelm a live candidate.
4. RETURN FORMAT:
   - Format your response with markdown (bolding, backticks for code/variables).
   - At the very end of your response, on a new line, you MUST append a JSON metadata block strictly in this format:
<<<METADATA>>>
{"caption":"Short 1-sentence summary suitable for live audio subtitle","mood":"Attentive|Evaluating Strategy|Probing Trade-offs|Analyzing Traceback|Complexity Review|Impressed","nextState":"GREETING|PROBLEM_CLARIFICATION|CODING|REVIEW_AND_COMPLEXITY|COMPLETED"}
<<<END_METADATA>>>`;
}

/**
 * Generates an intelligent, conversational response from Gemini for the LeetCode interview.
 */
export async function generateGeminiLeetCodeResponse({
  problem,
  persona,
  messages,
  userMessage,
  candidateCode,
  language,
  executionResult,
  testResults,
  isCodeRun = false,
  isSubmission = false
}: {
  problem: CodingProblem;
  persona: PersonaType;
  messages: Message[];
  userMessage?: string;
  candidateCode: string;
  language: SupportedLanguage;
  executionResult?: ExecutionResult | null;
  testResults?: TestCaseResult[] | null;
  isCodeRun?: boolean;
  isSubmission?: boolean;
}): Promise<LeetCodeAgentOutput> {
  const apiKey = getGeminiApiKey();

  // If no Gemini API key is configured, fallback to friendly offline response
  if (!apiKey) {
    return {
      text: `Welcome to **${problem.title}**! To enable full conversational AI guidance (like ChatGPT) with live problem understanding and code feedback, please ensure your Gemini API key is configured in \`.env\` or the settings modal. In the meantime, take a look at the problem description on the right and start exploring the brute-force approach!`,
      caption: `Welcome! Let's explore your approach for ${problem.title}.`,
      mood: 'Attentive',
      nextState: 'CODING'
    };
  }

  const systemInstruction = buildSystemInstruction(persona, problem);

  // Build conversation history for Gemini
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // Recent messages (last 10 turns to preserve context window and latency)
  const recentMessages = messages.slice(-10);
  for (const msg of recentMessages) {
    if (msg.sender === 'user') {
      contents.push({ role: 'user', parts: [{ text: msg.text }] });
    } else if (msg.sender === 'ai') {
      // Strip any previous metadata blocks from stored text
      const cleanText = msg.text.replace(/<<<METADATA>>>[\s\S]*?<<<END_METADATA>>>/g, '').trim();
      contents.push({ role: 'model', parts: [{ text: cleanText }] });
    }
  }

  // Construct current prompt context
  let currentPromptText = '';

  if (isSubmission && testResults) {
    const failedCases = testResults.filter(tc => !tc.passed);
    const passedCount = testResults.length - failedCases.length;

    currentPromptText = `[CANDIDATE SUBMITTED SOLUTION]
Selected Language: ${language}
Current Code in Editor:
\`\`\`${language}
${candidateCode}
\`\`\`
Test Results: ${passedCount}/${testResults.length} test cases passed.
${
  failedCases.length > 0
    ? `Failed on Case: Input: ${failedCases[0].input} | Expected: ${failedCases[0].expected} | Actual: ${failedCases[0].actual || 'error'}`
    : `All ${testResults.length} test cases passed successfully!`
}

Evaluate this submission. If all passed, congratulate them and ask them to analyze the Time and Space complexity. If failed, guide them to see why that edge case failed without giving the answer away directly.`;
  } else if (isCodeRun && executionResult) {
    currentPromptText = `[CANDIDATE RAN CODE]
Selected Language: ${language}
Current Code in Editor:
\`\`\`${language}
${candidateCode}
\`\`\`
Execution Result:
- Exit Code: ${executionResult.code}
- Stdout: ${executionResult.stdout || '(none)'}
- Stderr/Traceback: ${executionResult.stderr || '(none)'}

Provide brief, insightful feedback on what just happened or what to fix next.`;
  } else if (userMessage) {
    currentPromptText = `[CANDIDATE MESSAGE]
Candidate says: "${userMessage}"

[CURRENT EDITOR STATE]
Language: ${language}
Current Code:
\`\`\`${language}
${candidateCode || '(no code written yet)'}
\`\`\`

Respond directly, conversationally, and helpfully to what the candidate just said. If they asked for an approach or said it is hard, guide them step-by-step!`;
  } else {
    // Initial greeting prompt
    currentPromptText = `Please give a warm, professional, and brief opening greeting introducing yourself and the problem "${problem.title}" (${problem.difficulty}). Invite the candidate to share their initial thoughts or approach before jumping into code.`;
  }

  contents.push({ role: 'user', parts: [{ text: currentPromptText }] });

  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL, 'gemini-pro-latest'];

  for (const modelName of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 600
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Gemini LeetCode error on ${modelName} (${response.status}):`, errText);
        continue;
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      // Extract metadata block
      let cleanText = rawText;
      let caption = '';
      let mood: InterviewMood = 'Evaluating Strategy';
      let nextState: InterviewState | undefined = undefined;

      const metaMatch = rawText.match(/<<<METADATA>>>([\s\S]*?)<<<END_METADATA>>>/);
      if (metaMatch && metaMatch[1]) {
        try {
          const metaJson = JSON.parse(metaMatch[1].trim());
          if (metaJson.caption) caption = metaJson.caption;
          if (metaJson.mood) mood = metaJson.mood;
          if (metaJson.nextState) nextState = metaJson.nextState;
        } catch {
          // Ignored metadata parse error
        }
        cleanText = rawText.replace(/<<<METADATA>>>[\s\S]*?<<<END_METADATA>>>/g, '').trim();
      }

      if (!caption) {
        // Derive clean caption from first sentence
        caption = cleanText.split('\n')[0].slice(0, 120);
      }

      return {
        text: cleanText,
        caption,
        mood,
        nextState
      };
    } catch (err) {
      console.warn(`Failed to call ${modelName}:`, err);
    }
  }

  // Graceful fallback if Gemini calls fail
  return {
    text: `I'm analyzing your approach for **${problem.title}**. Think about how you would solve this manually with pencil and paper. What's the brute-force approach, and what data structure could help optimize the lookup time?`,
    caption: `Let's break down the optimal approach for ${problem.title}.`,
    mood: 'Attentive',
    nextState: 'CODING'
  };
}
