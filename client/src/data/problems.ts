import type { CodingProblem } from '../types';

export const PROBLEMS: CodingProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    tags: ['Array', 'Hash Table'],
    acceptanceRate: '52.4%',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    starterCode: {
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    pass
`,
      javascript: `function twoSum(nums, target) {
    // Write your solution here
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};
`
    },
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', expected: '[1,2]' },
      { input: 'nums = [3,3], target = 6', expected: '[0,1]' },
      { input: 'nums = [1,5,8,3], target = 11', expected: '[2,3]' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(N)',
    hints: [
      'Level 1: A brute-force nested loop takes O(N^2) time. Can we find a pair in a single pass?',
      'Level 2: Consider what information you need at each step: given element x, what number y would satisfy x + y = target?',
      'Level 3: Store every visited number and its index in a Hash Table (map/dict) so complement lookup is O(1).',
      'Level 4: Edge case: Beware of using the same element index twice.'
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    tags: ['String', 'Stack'],
    acceptanceRate: '41.2%',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only: ()[]{}'
    ],
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
      { input: 's = "([)]"', output: 'false' }
    ],
    starterCode: {
      python: `def is_valid(s: str) -> bool:
    # Write your solution here
    pass
`,
      javascript: `function isValid(s) {
    // Write your solution here
    
}
`,
      cpp: `#include <string>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        return false;
    }
};
`
    },
    testCases: [
      { input: 's = "()"', expected: 'true' },
      { input: 's = "()[]{}"', expected: 'true' },
      { input: 's = "(]"', expected: 'false' },
      { input: 's = "([)]"', expected: 'false' },
      { input: 's = "{[]}"', expected: 'true' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(N)',
    hints: [
      'Level 1: Notice how the latest bracket opened is the first one that must be closed? This is Last-In First-Out (LIFO).',
      'Level 2: Use a Stack data structure. Push opening brackets `(`, `{`, `[`.',
      'Level 3: When encountering a closing bracket, pop the top of the stack and check if they match.',
      'Level 4: Edge case: What if a string starts with a closing bracket, or has leftover open brackets when done?'
    ]
  },
  {
    id: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    category: 'Sliding Window',
    tags: ['Array', 'Dynamic Programming', 'Sliding Window'],
    acceptanceRate: '54.1%',
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the *maximum profit* you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ],
    examples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and max profit = 0.'
      }
    ],
    starterCode: {
      python: `def max_profit(prices: list[int]) -> int:
    # Write your solution here
    pass
`,
      javascript: `function maxProfit(prices) {
    // Write your solution here
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Write your solution here
        return 0;
    }
};
`
    },
    testCases: [
      { input: 'prices = [7,1,5,3,6,4]', expected: '5' },
      { input: 'prices = [7,6,4,3,1]', expected: '0' },
      { input: 'prices = [2,4,1]', expected: '2' },
      { input: 'prices = [3,2,6,5,0,3]', expected: '4' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(1)',
    hints: [
      'Level 1: Can you solve this in a single scan without checking all buy-sell combinations?',
      'Level 2: At day `i`, what is the minimum price you could have bought at in all previous days?',
      'Level 3: Keep two variables: `min_price` and `max_profit`. Update `min_price` when a lower price is found, otherwise check current profit.',
      'Level 4: Edge case: If prices are strictly decreasing, return 0.'
    ]
  },
  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'Linked List',
    tags: ['Linked List', 'Recursion', 'Two Pointers'],
    acceptanceRate: '63.8%',
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    constraints: [
      'The number of nodes in both lists is in the range [0, 50].',
      '-100 <= Node.val <= 100',
      'Both list1 and list2 are sorted in non-decreasing order.'
    ],
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', output: '[]' },
      { input: 'list1 = [], list2 = [0]', output: '[0]' }
    ],
    starterCode: {
      python: `def merge_two_lists(list1: list[int], list2: list[int]) -> list[int]:
    # Write your solution here
    pass
`,
      javascript: `function mergeTwoLists(list1, list2) {
    // Write your solution here
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> mergeTwoLists(vector<int>& list1, vector<int>& list2) {
        // Write your solution here
        return {};
    }
};
`
    },
    testCases: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', expected: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', expected: '[]' },
      { input: 'list1 = [], list2 = [0]', expected: '[0]' },
      { input: 'list1 = [5,10], list2 = [2,3,8,12]', expected: '[2,3,5,8,10,12]' }
    ],
    optimalTimeComplexity: 'O(N + M)',
    optimalSpaceComplexity: 'O(1) in-place pointers / O(N + M)',
    hints: [
      'Level 1: Since both lists are already sorted, which element must be the smallest of the combined result?',
      'Level 2: Compare the head nodes of each list. Pick the smaller one and advance its pointer.',
      'Level 3: A dummy head pointer simplifies edge cases with empty lists or head node assignment.',
      'Level 4: When one list runs out, directly attach the remainder of the other list.'
    ]
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray (Kadane\'s)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    acceptanceRate: '50.7%',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        input: 'nums = [1]',
        output: '1'
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23'
      }
    ],
    starterCode: {
      python: `def max_sub_array(nums: list[int]) -> int:
    # Write your solution here
    pass
`,
      javascript: `function maxSubArray(nums) {
    // Write your solution here
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your solution here
        return 0;
    }
};
`
    },
    testCases: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { input: 'nums = [1]', expected: '1' },
      { input: 'nums = [5,4,-1,7,8]', expected: '23' },
      { input: 'nums = [-1]', expected: '-1' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(1)',
    hints: [
      'Level 1: If a prefix sum dips below 0, can it ever contribute positively to any subsequent subarray?',
      'Level 2: When the running sum becomes negative, reset it to 0 (or start fresh with the current number).',
      'Level 3: This linear DP technique is known as Kadane\'s Algorithm: `cur_sum = max(num, cur_sum + num)`.',
      'Level 4: Edge case: All negative numbers (e.g. [-3, -1, -5]). Max sum should be -1, not 0.'
    ]
  },
  {
    id: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    acceptanceRate: '34.9%',
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.'
      }
    ],
    starterCode: {
      python: `def length_of_longest_substring(s: str) -> int:
    # Write your solution here
    pass
`,
      javascript: `function lengthOfLongestSubstring(s) {
    // Write your solution here
    
}
`,
      cpp: `#include <string>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your solution here
        return 0;
    }
};
`
    },
    testCases: [
      { input: 's = "abcabcbb"', expected: '3' },
      { input: 's = "bbbbb"', expected: '1' },
      { input: 's = "pwwkew"', expected: '3' },
      { input: 's = ""', expected: '0' },
      { input: 's = "dvdf"', expected: '3' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(min(N, M)) where M is character set size',
    hints: [
      'Level 1: Can we maintain a sliding window [left, right] of characters without duplicates?',
      'Level 2: Use a hash table or array map to store the last seen index of each character.',
      'Level 3: When a duplicate is seen at `right`, slide `left` to `last_index + 1` (make sure not to move left backwards).',
      'Level 4: Edge case: Empty string `s = ""` should return 0.'
    ]
  },
  {
    id: 'three-sum',
    title: '3Sum',
    difficulty: 'Medium',
    category: 'Two Pointers',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    acceptanceRate: '34.1%',
    description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5'
    ],
    examples: [
      {
        input: 'nums = [-1,0,1,2,-1,-4]',
        output: '[[-1,-1,2],[-1,0,1]]',
        explanation: 'nums[0] + nums[1] + nums[2] == (-1) + 0 + 1 == 0.'
      },
      {
        input: 'nums = [0,1,1]',
        output: '[]',
        explanation: 'The only possible triplet does not sum up to 0.'
      },
      {
        input: 'nums = [0,0,0]',
        output: '[[0,0,0]]'
      }
    ],
    starterCode: {
      python: `def three_sum(nums: list[int]) -> list[list[int]]:
    # Write your solution here
    pass
`,
      javascript: `function threeSum(nums) {
    // Write your solution here
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Write your solution here
        return {};
    }
};
`
    },
    testCases: [
      { input: 'nums = [-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]' },
      { input: 'nums = [0,1,1]', expected: '[]' },
      { input: 'nums = [0,0,0]', expected: '[[0,0,0]]' }
    ],
    optimalTimeComplexity: 'O(N^2)',
    optimalSpaceComplexity: 'O(1) auxiliary (ignoring output)',
    hints: [
      'Level 1: Sorting the array first takes O(N log N) time, but enables two-pointer convergence.',
      'Level 2: Fix the first element `nums[i]`, then use two pointers `left` and `right` for the remaining array.',
      'Level 3: If the sum < 0, advance `left`. If sum > 0, decrement `right`.',
      'Level 4: Critical: Skip duplicate values for `i`, `left`, and `right` to prevent duplicate triplets.'
    ]
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tags: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
    acceptanceRate: '43.2%',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the *fewest number of coins* that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4'
    ],
    examples: [
      {
        input: 'coins = [1,2,5], amount = 11',
        output: '3',
        explanation: '11 = 5 + 5 + 1'
      },
      {
        input: 'coins = [2], amount = 3',
        output: '-1'
      },
      {
        input: 'coins = [1], amount = 0',
        output: '0'
      }
    ],
    starterCode: {
      python: `def coin_change(coins: list[int], amount: int) -> int:
    # Write your solution here
    pass
`,
      javascript: `function coinChange(coins, amount) {
    // Write your solution here
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // Write your solution here
        return -1;
    }
};
`
    },
    testCases: [
      { input: 'coins = [1,2,5], amount = 11', expected: '3' },
      { input: 'coins = [2], amount = 3', expected: '-1' },
      { input: 'coins = [1], amount = 0', expected: '0' },
      { input: 'coins = [2,5,10,1], amount = 27', expected: '4' }
    ],
    optimalTimeComplexity: 'O(amount * len(coins))',
    optimalSpaceComplexity: 'O(amount)',
    hints: [
      'Level 1: Greedy choices (picking largest coin) do not always work for arbitrary coin denominations. Think Dynamic Programming.',
      'Level 2: Define `dp[i]` as the minimum coins needed to make amount `i`. Base case: `dp[0] = 0`.',
      'Level 3: Transition: For each coin, `dp[i] = min(dp[i], dp[i - coin] + 1)`.',
      'Level 4: If `dp[amount]` remains infinity/unreachable, return -1.'
    ]
  },
  {
    id: 'binary-tree-level-order-traversal',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['Tree', 'Breadth-First Search', 'Binary Tree'],
    acceptanceRate: '67.0%',
    description: `Given the \`root\` of a binary tree, return *the level order traversal of its nodes' values*. (i.e., from left to right, level by level).`,
    constraints: [
      'The number of nodes in the tree is in the range [0, 2000].',
      '-1000 <= Node.val <= 1000'
    ],
    examples: [
      {
        input: 'root = [3,9,20,null,null,15,7]',
        output: '[[3],[9,20],[15,7]]'
      },
      {
        input: 'root = [1]',
        output: '[[1]]'
      },
      {
        input: 'root = []',
        output: '[]'
      }
    ],
    starterCode: {
      python: `def level_order(nodes: list) -> list[list[int]]:
    # Write your solution here
    pass
`,
      javascript: `function levelOrder(nodes) {
    // Write your solution here
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> levelOrder(vector<int>& nodes) {
        // Write your solution here
        return {};
    }
};
`
    },
    testCases: [
      { input: 'root = [3,9,20,null,null,15,7]', expected: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', expected: '[[1]]' },
      { input: 'root = []', expected: '[]' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(N) (queue stores max level width)',
    hints: [
      'Level 1: Level-order traversal matches Breadth-First Search (BFS).',
      'Level 2: Use a Queue data structure (FIFO). Push root.',
      'Level 3: For each level, snapshot `queue.length` to process exactly one level per iteration.',
      'Level 4: Edge case: Empty tree should return an empty array `[]`.'
    ]
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointers',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Monotonic Stack'],
    acceptanceRate: '61.4%',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The elevation map traps 6 units of rain water.'
      },
      {
        input: 'height = [4,2,0,3,2,5]',
        output: '9'
      }
    ],
    starterCode: {
      python: `def trap(height: list[int]) -> int:
    # Write your solution here
    pass
`,
      javascript: `function trap(height) {
    // Write your solution here
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        // Write your solution here
        return 0;
    }
};
`
    },
    testCases: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' },
      { input: 'height = [4,2,0,3,2,5]', expected: '9' },
      { input: 'height = [1,2,3]', expected: '0' },
      { input: 'height = [5,0,5]', expected: '5' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(1) with two pointers / O(N) with prefix arrays',
    hints: [
      'Level 1: How much water can be held above position `i`? It is bounded by `min(max_left, max_right) - height[i]`.',
      'Level 2: You can precompute prefix and suffix maximums in O(N) space, or optimize to O(1) space with two pointers.',
      'Level 3: With two pointers `left` and `right`, advance the side with the smaller max wall because that side is the bottleneck.',
      'Level 4: Edge case: Strictly increasing or decreasing heights hold 0 water.'
    ]
  }
];
