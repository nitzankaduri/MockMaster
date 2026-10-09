import type { CodingProblem, InterviewMood, InterviewState, InterviewerPersona, PersonaType, TestCaseResult } from '../types';

export const PERSONAS: Record<PersonaType, InterviewerPersona> = {
  mentor: {
    id: 'mentor',
    name: 'Sarah Chen',
    title: 'Staff Software Engineer',
    company: 'MockMaster Core Platform',
    seniority: 'STAFF L6',
    avatarSeed: 'sarah',
    accentColor: 'cyan',
    tagline: 'Supportive & Collaborative Guide',
    styleDescription:
      'Warm and encouraging. Focuses on building your intuition, unblocking logic traps, and fostering collaborative engineering discussions.'
  },
  bar_raiser: {
    id: 'bar_raiser',
    name: 'Marcus Vance',
    title: 'Principal Systems Architect',
    company: 'FAANG Infrastructure',
    seniority: 'PRINCIPAL L7',
    avatarSeed: 'marcus',
    accentColor: 'violet',
    tagline: 'Rigorous & High-Standard Bar Raiser',
    styleDescription:
      'Direct and demanding. Expects mathematically sound Big-O proofs, zero tolerance for unhandled edge cases, and architectural clarity under pressure.'
  }
};

const MENTOR_ACKNOWLEDGMENTS = [
  'Got it, that makes sense.',
  'Interesting angle—let us explore that.',
  'Good intuition so far.',
  'Fair point, feel free to proceed with that idea.',
  'I see where you are headed.'
];

const BAR_RAISER_ACKNOWLEDGMENTS = [
  'Understood. Let us verify that assumption.',
  'Noted. What are the secondary trade-offs?',
  'Fair enough, but let us scrutinize the boundary cases.',
  'Okay. How does that hold under heavy load?',
  'Go ahead, but be prepared to justify the memory footprint.'
];

export function getRandomAcknowledgment(persona: PersonaType): string {
  const list = persona === 'mentor' ? MENTOR_ACKNOWLEDGMENTS : BAR_RAISER_ACKNOWLEDGMENTS;
  return list[Math.floor(Math.random() * list.length)];
}

export function generateGreeting(persona: PersonaType, problem: CodingProblem): string {
  if (persona === 'mentor') {
    return `Hi! I'm Sarah Chen, Staff Engineer here at MockMaster. Great to meet you! Today we will be looking at **${problem.title}** (${problem.difficulty} — ${problem.category}).\n\nPlease take a minute to read through the description and example test cases. Before jumping into code, I'd love to hear how you're thinking about approaching this!`;
  }
  return `Hello, candidate. I am Marcus Vance, Principal Architect. Today we are assessing algorithmic rigor on **${problem.title}** (${problem.difficulty}).\n\nReview the constraints carefully. I expect an optimal solution matching our target efficiency (${problem.optimalTimeComplexity} time, ${problem.optimalSpaceComplexity} space). Walk me through your approach before writing a single line of code.`;
}

export function generateStrategyFeedback(
  persona: PersonaType,
  text: string,
  problem: CodingProblem
): { text: string; mood: InterviewMood; nextState: InterviewState } {
  const lower = text.toLowerCase();
  const ack = getRandomAcknowledgment(persona);

  // Check for brute force
  if (
    lower.includes('brute force') ||
    lower.includes('nested loop') ||
    lower.includes('o(n^2)') ||
    lower.includes('o(n2)') ||
    lower.includes('o(2^n)')
  ) {
    if (persona === 'mentor') {
      return {
        text: `${ack} A brute-force nested scan is always a great initial baseline to make sure we understand the problem mechanics! However, on larger inputs it would take quadratic time. Can we think of a data structure like a hash table or two pointers to bring this down closer to ${problem.optimalTimeComplexity}?`,
        mood: 'Evaluating Strategy',
        nextState: 'PROBLEM_CLARIFICATION'
      };
    } else {
      return {
        text: `${ack} A quadratic O(N²) brute-force solution is unacceptable given our constraints (${problem.constraints[0] || 'large N'}). What data structure or invariant allows us to resolve queries in amortized O(1) or O(log N) time? I need an optimal O(N) strategy.`,
        mood: 'Probing Trade-offs',
        nextState: 'PROBLEM_CLARIFICATION'
      };
    }
  }

  // Check for optimal keywords
  if (
    lower.includes('hash') ||
    lower.includes('map') ||
    lower.includes('stack') ||
    lower.includes('two pointer') ||
    lower.includes('sliding window') ||
    lower.includes('dynamic programming') ||
    lower.includes('dp') ||
    lower.includes('bfs') ||
    lower.includes('queue') ||
    lower.includes('sort') ||
    lower.includes('single pass') ||
    lower.includes('kadane')
  ) {
    if (persona === 'mentor') {
      return {
        text: `${ack} Spot-on intuition! Leveraging that approach directly positions us to hit our target ${problem.optimalTimeComplexity} runtime. Feel free to dive into the editor on the right and start writing the code!`,
        mood: 'Evaluating Strategy',
        nextState: 'CODING'
      };
    } else {
      return {
        text: `${ack} That aligns with the expected algorithmic pattern. However, ensure your invariant accounts for boundary conditions such as empty collections or duplicate keys. Proceed to implementation in the editor.`,
        mood: 'Evaluating Strategy',
        nextState: 'CODING'
      };
    }
  }

  // Clarifications
  if (
    lower.includes('constraint') ||
    lower.includes('negative') ||
    lower.includes('empty') ||
    lower.includes('null') ||
    lower.includes('duplicate')
  ) {
    if (persona === 'mentor') {
      return {
        text: `${ack} Great question to clarify early on! The constraints specify: ${problem.constraints.slice(0, 2).join('; ')}. Keeping these edge conditions in mind as you code will make your solution super robust!`,
        mood: 'Attentive',
        nextState: 'PROBLEM_CLARIFICATION'
      };
    } else {
      return {
        text: `${ack} Good engineers clarify specifications before coding. Constraints: ${problem.constraints.slice(0, 2).join('; ')}. If your implementation allocates excessive memory or fails on boundary values, it will not pass. Begin coding.`,
        mood: 'Probing Trade-offs',
        nextState: 'CODING'
      };
    }
  }

  // Default response
  if (persona === 'mentor') {
    return {
      text: `${ack} Sounds like a sensible direction. Feel free to start implementing your solution in the Monaco sandbox, and let me know if you run into any hurdles along the way!`,
      mood: 'Evaluating Strategy',
      nextState: 'CODING'
    };
  } else {
    return {
      text: `${ack} Proceed with the implementation, but verify your edge conditions continuously. You may test the code in the sandbox.`,
      mood: 'Evaluating Strategy',
      nextState: 'CODING'
    };
  }
}

export function generateTracebackFeedback(
  persona: PersonaType,
  errorText: string
): { text: string; mood: InterviewMood } {
  const shortError = errorText.split('\n')[0];

  if (persona === 'mentor') {
    let guidance = `Don't worry, runtime errors happen all the time during live coding! Looking at the traceback: "${shortError}". `;
    if (errorText.includes('SyntaxError') || errorText.includes('expected')) {
      guidance += `It looks like a syntax or formatting issue near the indicated line. Double check colons, indentation, and brackets.`;
    } else if (errorText.includes('IndexError') || errorText.includes('out of range')) {
      guidance += `An index is overstepping the array bounds. What happens when the input is empty or when reaching the final loop element?`;
    } else if (errorText.includes('KeyError') || errorText.includes('undefined')) {
      guidance += `A key was accessed that hasn't been inserted into the map yet. How can we verify its existence first?`;
    } else {
      guidance += `Let's inspect the call stack together—what variables might be in an unexpected state at this point?`;
    }
    return { text: guidance, mood: 'Analyzing Traceback' };
  } else {
    let critique = `Execution failure detected: "${shortError}". `;
    if (errorText.includes('SyntaxError') || errorText.includes('expected')) {
      critique += `Syntax and parsing errors reflect poorly on code fluency. Resolve the syntax issue at once.`;
    } else if (errorText.includes('IndexError') || errorText.includes('out of range')) {
      critique += `Off-by-one or unchecked bound error. In production, this causes panic or segmentation fault. Trace your loop invariant.`;
    } else if (errorText.includes('KeyError') || errorText.includes('undefined')) {
      critique += `Unsafe map lookup without checking containment. Defend against missing keys.`;
    } else {
      critique += `Your code crashed under basic execution. Debug the traceback and rectify the logic.`;
    }
    return { text: critique, mood: 'Analyzing Traceback' };
  }
}

export function generateSubmissionFeedback(
  persona: PersonaType,
  passedCount: number,
  totalCount: number,
  failedCase: TestCaseResult | undefined,
  problem: CodingProblem
): { text: string; mood: InterviewMood; nextState?: InterviewState } {
  if (passedCount === totalCount && totalCount > 0) {
    if (persona === 'mentor') {
      return {
        text: `Wonderful job! All ${totalCount} test cases passed cleanly! Your logic is working as expected. Now for the fun part: could you walk me through the Big-O Time and Space Complexity of your implementation?`,
        mood: 'Complexity Review',
        nextState: 'REVIEW_AND_COMPLEXITY'
      };
    } else {
      return {
        text: `All ${totalCount} unit test cases succeeded. Correctness is the bare minimum requirement. Now prove the theoretical bounds: state your exact Time Complexity and auxiliary Space Complexity, and defend why it meets ${problem.optimalTimeComplexity}.`,
        mood: 'Complexity Review',
        nextState: 'REVIEW_AND_COMPLEXITY'
      };
    }
  }

  if (failedCase) {
    if (persona === 'mentor') {
      return {
        text: `Good progress! You passed ${passedCount} out of ${totalCount} test cases. On Case #${failedCase.index} with input: \`${failedCase.input}\`, your solution returned \`${failedCase.actual || 'incorrect result'}\` instead of \`${failedCase.expected}\`. What special condition or boundary might this input be testing?`,
        mood: 'Evaluating Strategy'
      };
    } else {
      return {
        text: `Test suite rejected: ${totalCount - passedCount} failed case(s). Case #${failedCase.index} failed on input \`${failedCase.input}\` (Output: \`${failedCase.actual}\`, Expected: \`${failedCase.expected}\`). Your implementation fails to handle this invariant. Rectify it.`,
        mood: 'Probing Trade-offs'
      };
    }
  }

  return {
    text: `Code executed. Review the output in the console.`,
    mood: 'Attentive'
  };
}

export function generateComplexityFeedback(
  persona: PersonaType,
  text: string,
  problem: CodingProblem
): { text: string; mood: InterviewMood; completed: boolean } {
  const lower = text.toLowerCase();

  const mentionsOptimalTime =
    (problem.optimalTimeComplexity.includes('O(N)') &&
      (lower.includes('o(n)') || lower.includes('linear') || lower.includes('o of n'))) ||
    (problem.optimalTimeComplexity.includes('O(N^2)') &&
      (lower.includes('o(n^2)') || lower.includes('quadratic') || lower.includes('n squared'))) ||
    (problem.optimalTimeComplexity.includes('O(N + M)') &&
      (lower.includes('o(n + m)') || lower.includes('o(n+m)') || lower.includes('linear')));

  const mentionsOptimalSpace =
    (problem.optimalSpaceComplexity.includes('O(1)') &&
      (lower.includes('o(1)') || lower.includes('constant') || lower.includes('o of 1'))) ||
    (problem.optimalSpaceComplexity.includes('O(N)') &&
      (lower.includes('o(n)') || lower.includes('linear') || lower.includes('auxiliary space')));

  if (mentionsOptimalTime && mentionsOptimalSpace) {
    if (persona === 'mentor') {
      return {
        text: `Spot on! You nailed both the ${problem.optimalTimeComplexity} time complexity and ${problem.optimalSpaceComplexity} space complexity. Your code is clean, optimal, and your communication was fantastic throughout. That's a strong pass from me!`,
        mood: 'Impressed',
        completed: true
      };
    } else {
      return {
        text: `Correct. Time complexity: ${problem.optimalTimeComplexity}. Auxiliary space: ${problem.optimalSpaceComplexity}. You demonstrated sound algorithmic discipline under strict scrutiny. This interview problem is officially cleared.`,
        mood: 'Impressed',
        completed: true
      };
    }
  }

  if (mentionsOptimalTime) {
    if (persona === 'mentor') {
      return {
        text: `Yes, exactly right on time complexity (${problem.optimalTimeComplexity})! Now, what about the auxiliary memory consumed by your variables or data structures? What is the space complexity?`,
        mood: 'Complexity Review',
        completed: false
      };
    } else {
      return {
        text: `Time complexity is verified as ${problem.optimalTimeComplexity}. What about auxiliary memory? Do not gloss over heap allocation. What is the space complexity?`,
        mood: 'Complexity Review',
        completed: false
      };
    }
  }

  if (persona === 'mentor') {
    return {
      text: `Let's trace through the operations: with respect to input size N, how many times does our loop or recursion execute? Is it linear, logarithmic, or quadratic?`,
      mood: 'Complexity Review',
      completed: false
    };
  } else {
    return {
      text: `That analysis is imprecise. Trace your dominant operation: how does it scale as N grows to 10^5? State the formal Big-O time complexity.`,
      mood: 'Complexity Review',
      completed: false
    };
  }
}

export function generateIdleNudge(
  persona: PersonaType,
  currentHint: string,
  hintLevel: number,
  totalHints: number
): string {
  if (persona === 'mentor') {
    return `Hey! I noticed you've been pausing on this logic for a minute or two—no stress, that's completely normal on this problem. Here is a progressive nudge (Hint ${hintLevel}/${totalHints}) to help unblock your thinking:\n\n💡 *${currentHint}*\n\nTake your time, and let me know how you want to apply that!`;
  }
  return `Candidate, you have been idle for 90+ seconds without code progression. In an actual technical round, silence burns critical interview time. Consider this structural hint (${hintLevel}/${totalHints}):\n\n⚠️ *${currentHint}*\n\nFormulate your implementation immediately.`;
}
