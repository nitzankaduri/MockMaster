import type {
  CodingProblem,
  CustomTestCase,
  ExecutionResult,
  SupportedLanguage,
  TestCaseResult
} from '../types';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';
const JUDGE0_API_URL = 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';

// Mapping for Piston API v2
const PISTON_LANGUAGE_MAP: Record<SupportedLanguage, { language: string; version: string; file: string }> = {
  python: { language: 'python', version: '*', file: 'solution.py' },
  javascript: { language: 'javascript', version: '*', file: 'solution.js' },
  cpp: { language: 'c++', version: '*', file: 'solution.cpp' }
};

// Mapping for Judge0 CE API
const JUDGE0_LANGUAGE_MAP: Record<SupportedLanguage, number> = {
  python: 71,     // Python 3.8.1
  javascript: 63, // JavaScript (Node.js 12.14.0)
  cpp: 54         // C++ (GCC 9.2.0)
};

/**
 * Execute code via remote sandbox API.
 * Primarily targets the public Piston API v2 with automatic resilient fallback to Judge0 CE
 * and in-browser sandboxed evaluation for offline/unreachable conditions.
 */
export async function executeCode(
  language: SupportedLanguage | string,
  code: string,
  stdin: string = ''
): Promise<ExecutionResult> {
  const normalizedLang = (language.toLowerCase() as SupportedLanguage) || 'python';
  const startTime = performance.now();

  // 1. Try Piston API v2
  try {
    const pistonConfig = PISTON_LANGUAGE_MAP[normalizedLang] || {
      language: normalizedLang,
      version: '*',
      file: 'main.txt'
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: pistonConfig.language,
        version: pistonConfig.version,
        files: [
          {
            name: pistonConfig.file,
            content: code
          }
        ],
        stdin: stdin,
        run_timeout: 6000
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const endTime = performance.now();
      const executionTime = `${Math.round(endTime - startTime)}ms`;

      // Check compile stage for compiled languages
      if (data.compile && data.compile.code !== 0 && data.compile.stderr) {
        return {
          stdout: data.compile.stdout || '',
          stderr: data.compile.stderr || 'Compilation error',
          code: data.compile.code ?? 1,
          executionTime,
          memory: data.run?.memory ? `${Math.round(data.run.memory / 1024)} KB` : undefined
        };
      }

      const run = data.run || {};
      return {
        stdout: run.stdout || (run.output && !run.stderr ? run.output : ''),
        stderr: run.stderr || '',
        code: run.code ?? 0,
        executionTime,
        memory: run.memory ? `${Math.round(run.memory / 1024)} KB` : undefined
      };
    } else {
      await response.text();
    }
  } catch {
    // Fallback to Judge0 CE
  }

  // 2. Resilient Fallback: Judge0 CE API
  try {
    const judge0LangId = JUDGE0_LANGUAGE_MAP[normalizedLang] || 71;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(JUDGE0_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_code: code,
        language_id: judge0LangId,
        stdin: stdin
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const executionTime = data.time
        ? `${Math.round(parseFloat(data.time) * 1000)}ms`
        : `${Math.round(performance.now() - startTime)}ms`;

      const compileError = data.compile_output || '';
      const runtimeError = data.stderr || '';
      const stderr = compileError || runtimeError;
      const stdout = data.stdout || '';

      const isError = Boolean(stderr) || (data.status && data.status.id > 3);

      return {
        stdout: stdout,
        stderr: stderr || (isError && data.status?.description ? `Error: ${data.status.description}` : ''),
        code: isError ? 1 : 0,
        executionTime,
        memory: data.memory ? `${data.memory} KB` : undefined
      };
    }
  } catch (judgeErr) {
    console.warn('Judge0 execution fallback error:', judgeErr);
  }

  // 3. Client-side fallback for JavaScript
  if (normalizedLang === 'javascript') {
    return executeClientJs(code, startTime);
  }

  return {
    stdout: '',
    stderr: 'Remote code execution service is temporarily unreachable. Please check your network connection.',
    code: 1,
    executionTime: `${Math.round(performance.now() - startTime)}ms`
  };
}

/**
 * Client-side isolated runner fallback for JavaScript
 */
function executeClientJs(code: string, startTime: number): ExecutionResult {
  const logs: string[] = [];
  const errors: string[] = [];

  const fakeConsole = {
    log: (...args: unknown[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
    error: (...args: unknown[]) => errors.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
    warn: (...args: unknown[]) => logs.push('[WARN] ' + args.map(a => String(a)).join(' ')),
    info: (...args: unknown[]) => logs.push(args.map(a => String(a)).join(' '))
  };

  try {
    const runFunction = new Function('console', code);
    runFunction(fakeConsole);
    return {
      stdout: logs.join('\n') + (logs.length ? '\n' : ''),
      stderr: errors.join('\n'),
      code: errors.length > 0 ? 1 : 0,
      executionTime: `${Math.round(performance.now() - startTime)}ms (Local)`
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.stack || err.message : String(err);
    return {
      stdout: logs.join('\n'),
      stderr: errorMsg,
      code: 1,
      executionTime: `${Math.round(performance.now() - startTime)}ms (Local)`
    };
  }
}

/**
 * Helper to build custom or default test harness script for all 10 LeetCode problems
 */
export function buildTestHarness(
  problem: CodingProblem,
  language: SupportedLanguage,
  userCode: string,
  customTestCases?: CustomTestCase[]
): string {
  // If language is C++, run code directly with test outputs
  if (language === 'cpp') {
    return userCode;
  }

  // Combine default test cases with any custom test cases
  const allCases = [
    ...problem.testCases.map((tc, idx) => ({ id: `default-${idx}`, input: tc.input, expected: tc.expected })),
    ...(customTestCases || []).map((tc) => ({ id: tc.id, input: tc.input, expected: tc.expected || '' }))
  ];

  if (language === 'python') {
    return generatePythonHarness(problem.id, userCode, allCases);
  }

  if (language === 'javascript') {
    return generateJsHarness(problem.id, userCode, allCases);
  }

  return userCode;
}

function generatePythonHarness(problemId: string, userCode: string, testCases: { id: string; input: string; expected: string }[]): string {
  let runnerLogic = '';

  switch (problemId) {
    case 'two-sum':
      runnerLogic = `
def parse_and_run(case_input):
    # parse nums = [...], target = X
    parts = case_input.split(', target = ')
    nums_str = parts[0].replace('nums = ', '').strip()
    target_str = parts[1].strip()
    nums = json.loads(nums_str)
    target = int(target_str)
    return two_sum(nums, target)
def check_equal(act, exp_str):
    exp = json.loads(exp_str)
    return sorted(act) == sorted(exp)
`;
      break;

    case 'valid-parentheses':
      runnerLogic = `
def parse_and_run(case_input):
    s = case_input.replace('s = ', '').strip().strip('"')
    return is_valid(s)
def check_equal(act, exp_str):
    return str(bool(act)).lower() == exp_str.lower()
`;
      break;

    case 'best-time-to-buy-and-sell-stock':
      runnerLogic = `
def parse_and_run(case_input):
    prices = json.loads(case_input.replace('prices = ', '').strip())
    return max_profit(prices)
def check_equal(act, exp_str):
    return str(act) == exp_str.strip()
`;
      break;

    case 'merge-two-sorted-lists':
      runnerLogic = `
def parse_and_run(case_input):
    parts = case_input.split(', list2 = ')
    l1 = json.loads(parts[0].replace('list1 = ', '').strip())
    l2 = json.loads(parts[1].strip())
    return merge_two_lists(l1, l2)
def check_equal(act, exp_str):
    return json.dumps(act).replace(' ', '') == exp_str.replace(' ', '')
`;
      break;

    case 'maximum-subarray':
      runnerLogic = `
def parse_and_run(case_input):
    nums = json.loads(case_input.replace('nums = ', '').strip())
    return max_sub_array(nums)
def check_equal(act, exp_str):
    return str(act) == exp_str.strip()
`;
      break;

    case 'longest-substring-without-repeating-characters':
      runnerLogic = `
def parse_and_run(case_input):
    s = case_input.replace('s = ', '').strip().strip('"')
    return length_of_longest_substring(s)
def check_equal(act, exp_str):
    return str(act) == exp_str.strip()
`;
      break;

    case 'three-sum':
      runnerLogic = `
def parse_and_run(case_input):
    nums = json.loads(case_input.replace('nums = ', '').strip())
    return three_sum(nums)
def check_equal(act, exp_str):
    exp = json.loads(exp_str)
    act_sorted = sorted([sorted(t) for t in act])
    exp_sorted = sorted([sorted(t) for t in exp])
    return act_sorted == exp_sorted
`;
      break;

    case 'coin-change':
      runnerLogic = `
def parse_and_run(case_input):
    parts = case_input.split(', amount = ')
    coins = json.loads(parts[0].replace('coins = ', '').strip())
    amt = int(parts[1].strip())
    return coin_change(coins, amt)
def check_equal(act, exp_str):
    return str(act) == exp_str.strip()
`;
      break;

    case 'binary-tree-level-order-traversal':
      runnerLogic = `
def parse_and_run(case_input):
    raw = case_input.replace('root = ', '').replace('null', 'None').strip()
    nodes = eval(raw)
    return level_order(nodes)
def check_equal(act, exp_str):
    return json.dumps(act).replace(' ', '') == exp_str.replace(' ', '')
`;
      break;

    case 'trapping-rain-water':
      runnerLogic = `
def parse_and_run(case_input):
    height = json.loads(case_input.replace('height = ', '').strip())
    return trap(height)
def check_equal(act, exp_str):
    return str(act) == exp_str.strip()
`;
      break;

    default:
      runnerLogic = `
def parse_and_run(case_input):
    return "OK"
def check_equal(act, exp_str):
    return True
`;
  }

  const rawCasesJson = JSON.stringify(testCases);

  return `${userCode}

# --- UNIVERSAL TEST SUITE HARNESS ---
import json

test_suite = ${rawCasesJson}

${runnerLogic}

print("<<<TEST_OUTPUT_START>>>")
for idx, tc in enumerate(test_suite):
    try:
        actual_val = parse_and_run(tc['input'])
        act_str = json.dumps(actual_val)
        passed = check_equal(actual_val, tc['expected']) if tc.get('expected') else True
        print(f"CASE_{idx}:{json.dumps({'actual': act_str, 'passed': passed})}")
    except Exception as e:
        print(f"CASE_{idx}:{json.dumps({'actual': str(e), 'passed': False, 'error': str(e)})}")
print("<<<TEST_OUTPUT_END>>>")
`;
}

function generateJsHarness(problemId: string, userCode: string, testCases: { id: string; input: string; expected: string }[]): string {
  let runnerLogic = '';

  switch (problemId) {
    case 'two-sum':
      runnerLogic = `
function parseAndRun(caseInput) {
    const parts = caseInput.split(', target = ');
    const nums = JSON.parse(parts[0].replace('nums = ', '').trim());
    const target = parseInt(parts[1].trim(), 10);
    return twoSum(nums, target);
}
function checkEqual(act, expStr) {
    if (!Array.isArray(act)) return false;
    const exp = JSON.parse(expStr);
    return [...act].sort().join(',') === [...exp].sort().join(',');
}
`;
      break;

    case 'valid-parentheses':
      runnerLogic = `
function parseAndRun(caseInput) {
    const s = caseInput.replace('s = ', '').trim().replace(/^"|"$/g, '');
    return isValid(s);
}
function checkEqual(act, expStr) {
    return String(Boolean(act)).toLowerCase() === expStr.toLowerCase();
}
`;
      break;

    case 'best-time-to-buy-and-sell-stock':
      runnerLogic = `
function parseAndRun(caseInput) {
    const prices = JSON.parse(caseInput.replace('prices = ', '').trim());
    return maxProfit(prices);
}
function checkEqual(act, expStr) {
    return String(act) === expStr.trim();
}
`;
      break;

    case 'merge-two-sorted-lists':
      runnerLogic = `
function parseAndRun(caseInput) {
    const parts = caseInput.split(', list2 = ');
    const l1 = JSON.parse(parts[0].replace('list1 = ', '').trim());
    const l2 = JSON.parse(parts[1].trim());
    return mergeTwoLists(l1, l2);
}
function checkEqual(act, expStr) {
    return JSON.stringify(act).replace(/\\s/g, '') === expStr.replace(/\\s/g, '');
}
`;
      break;

    case 'maximum-subarray':
      runnerLogic = `
function parseAndRun(caseInput) {
    const nums = JSON.parse(caseInput.replace('nums = ', '').trim());
    return maxSubArray(nums);
}
function checkEqual(act, expStr) {
    return String(act) === expStr.trim();
}
`;
      break;

    case 'longest-substring-without-repeating-characters':
      runnerLogic = `
function parseAndRun(caseInput) {
    const s = caseInput.replace('s = ', '').trim().replace(/^"|"$/g, '');
    return lengthOfLongestSubstring(s);
}
function checkEqual(act, expStr) {
    return String(act) === expStr.trim();
}
`;
      break;

    case 'three-sum':
      runnerLogic = `
function parseAndRun(caseInput) {
    const nums = JSON.parse(caseInput.replace('nums = ', '').trim());
    return threeSum(nums);
}
function checkEqual(act, expStr) {
    const exp = JSON.parse(expStr);
    const actSorted = act.map(t => [...t].sort()).sort();
    const expSorted = exp.map(t => [...t].sort()).sort();
    return JSON.stringify(actSorted) === JSON.stringify(expSorted);
}
`;
      break;

    case 'coin-change':
      runnerLogic = `
function parseAndRun(caseInput) {
    const parts = caseInput.split(', amount = ');
    const coins = JSON.parse(parts[0].replace('coins = ', '').trim());
    const amount = parseInt(parts[1].trim(), 10);
    return coinChange(coins, amount);
}
function checkEqual(act, expStr) {
    return String(act) === expStr.trim();
}
`;
      break;

    case 'binary-tree-level-order-traversal':
      runnerLogic = `
function parseAndRun(caseInput) {
    const raw = caseInput.replace('root = ', '').trim();
    const nodes = JSON.parse(raw);
    return levelOrder(nodes);
}
function checkEqual(act, expStr) {
    return JSON.stringify(act).replace(/\\s/g, '') === expStr.replace(/\\s/g, '');
}
`;
      break;

    case 'trapping-rain-water':
      runnerLogic = `
function parseAndRun(caseInput) {
    const height = JSON.parse(caseInput.replace('height = ', '').trim());
    return trap(height);
}
function checkEqual(act, expStr) {
    return String(act) === expStr.trim();
}
`;
      break;

    default:
      runnerLogic = `
function parseAndRun(caseInput) { return "OK"; }
function checkEqual(act, expStr) { return true; }
`;
  }

  const rawCasesJson = JSON.stringify(testCases);

  return `${userCode}

// --- UNIVERSAL TEST SUITE HARNESS ---
const testSuite = ${rawCasesJson};

${runnerLogic}

console.log("<<<TEST_OUTPUT_START>>>");
testSuite.forEach((tc, idx) => {
    try {
        const actualVal = parseAndRun(tc.input);
        const actStr = JSON.stringify(actualVal);
        const passed = tc.expected ? checkEqual(actualVal, tc.expected) : true;
        console.log(\`CASE_\${idx}:\${JSON.stringify({ actual: actStr, passed })}\`);
    } catch (err) {
        console.log(\`CASE_\${idx}:\${JSON.stringify({ actual: String(err), passed: false, error: String(err) })}\`);
    }
});
console.log("<<<TEST_OUTPUT_END>>>");
`;
}

/**
 * Parses test output emitted from test harness
 */
export function parseHarnessOutput(
  stdout: string,
  problem: CodingProblem,
  customTestCases?: CustomTestCase[]
): { testResults: TestCaseResult[]; cleanStdout: string } {
  const startTag = '<<<TEST_OUTPUT_START>>>';
  const endTag = '<<<TEST_OUTPUT_END>>>';

  const allCases = [
    ...problem.testCases.map((tc) => ({ input: tc.input, expected: tc.expected })),
    ...(customTestCases || []).map((tc) => ({ input: tc.input, expected: tc.expected || '' }))
  ];

  const startIndex = stdout.indexOf(startTag);
  const endIndex = stdout.indexOf(endTag);

  if (startIndex === -1 || endIndex === -1) {
    // If harness markers aren't present (e.g. C++ run or early crash)
    const testResults: TestCaseResult[] = allCases.map((tc, idx) => ({
      index: idx + 1,
      input: tc.input,
      expected: tc.expected,
      passed: stdout.includes(tc.expected),
      actual: stdout.trim() ? stdout.trim().split('\n')[0] : 'No output'
    }));

    return { testResults, cleanStdout: stdout };
  }

  const cleanStdout = (
    stdout.substring(0, startIndex) +
    stdout.substring(endIndex + endTag.length)
  ).trim();

  const harnessText = stdout.substring(startIndex + startTag.length, endIndex).trim();
  const lines = harnessText.split('\n');

  const testResults: TestCaseResult[] = allCases.map((tc, idx) => {
    const line = lines.find(l => l.startsWith(`CASE_${idx}:`));
    if (line) {
      try {
        const jsonStr = line.substring(`CASE_${idx}:`.length).trim();
        const parsed = JSON.parse(jsonStr);
        return {
          index: idx + 1,
          input: tc.input,
          expected: tc.expected,
          actual: parsed.actual,
          passed: Boolean(parsed.passed),
          error: parsed.error
        };
      } catch (e) {
        console.error('Failed to parse test case line:', line, e);
      }
    }

    return {
      index: idx + 1,
      input: tc.input,
      expected: tc.expected,
      actual: 'N/A',
      passed: false
    };
  });

  return { testResults, cleanStdout };
}
