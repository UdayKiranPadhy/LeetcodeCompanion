import type {
  Problem,
  Language,
  ThoughtFeedback,
  MathProof,
  CodeStep,
  ChatContext,
} from '@/types';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function delay(min: number, max: number): Promise<void> {
  const ms = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ── Mock problem data ───────────────────────────────────────────────────── */
const MOCK_PROBLEMS: Record<string, Problem> = {
  default: {
    id: '1',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
      },
    ],
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      '-10⁹ ≤ target ≤ 10⁹',
      'Only one valid answer exists.',
    ],
  },
  'longest-substring': {
    id: '3',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
    ],
    constraints: [
      '0 ≤ s.length ≤ 5 × 10⁴',
      's consists of English letters, digits, symbols and spaces.',
    ],
  },
  'median-sorted-arrays': {
    id: '4',
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return **the median** of the two sorted arrays.

The overall run time complexity should be **O(log (m+n))**.`,
    examples: [
      {
        input: 'nums1 = [1, 3], nums2 = [2]',
        output: '2.00000',
        explanation: 'Merged array = [1, 2, 3] and median is 2.',
      },
      {
        input: 'nums1 = [1, 2], nums2 = [3, 4]',
        output: '2.50000',
        explanation: 'Merged array = [1, 2, 3, 4] and median is (2 + 3) / 2 = 2.5.',
      },
    ],
    constraints: [
      'nums1.length == m',
      'nums2.length == n',
      '0 ≤ m ≤ 1000',
      '0 ≤ n ≤ 1000',
      '1 ≤ m + n ≤ 2000',
      '-10⁶ ≤ nums1[i], nums2[i] ≤ 10⁶',
    ],
  },
};

function resolveProblem(input: string): Problem {
  const lower = input.toLowerCase();
  if (lower.includes('longest') || lower.includes('substring')) {
    return MOCK_PROBLEMS['longest-substring'];
  }
  if (lower.includes('median') || lower.includes('sorted')) {
    return MOCK_PROBLEMS['median-sorted-arrays'];
  }
  return MOCK_PROBLEMS['default'];
}

/* ── Mock solution data by language ──────────────────────────────────────── */
const MOCK_CODE: Record<Language, string> = {
  python: `def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,

  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{ seen.get(complement), i };
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`,

  javascript: `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`,
};

const MOCK_STEPS: Record<Language, CodeStep[]> = {
  python: [
    { lineRange: [1, 1], explanation: 'Define the function accepting the integer list `nums` and the `target` sum.' },
    { lineRange: [2, 2], explanation: '`seen` is our hash map — it stores each number mapped to its index, allowing O(1) lookups.' },
    { lineRange: [3, 3], explanation: 'Iterate with both index `i` and value `num` using Python\'s built-in `enumerate`.' },
    { lineRange: [4, 4], explanation: 'Compute the complement: the number that would pair with `num` to reach `target`.' },
    { lineRange: [5, 6], explanation: 'If the complement was already seen, we found our pair — return both indices immediately.' },
    { lineRange: [7, 7], explanation: 'Store this number and its index in the map before advancing to the next element.' },
  ],
  java: [
    { lineRange: [1, 1], explanation: 'Declare the Solution class as required by LeetCode\'s Java submission format.' },
    { lineRange: [2, 2], explanation: 'The method returns an `int[]` containing the two indices.' },
    { lineRange: [3, 3], explanation: '`HashMap<Integer, Integer>` maps each value to its array index for O(1) average-case lookup.' },
    { lineRange: [4, 4], explanation: 'Iterate through every element using a standard for-loop with index `i`.' },
    { lineRange: [5, 5], explanation: 'Compute the complement needed to reach `target` from `nums[i]`.' },
    { lineRange: [6, 8], explanation: 'If the complement exists in our map, construct and return the answer array.' },
    { lineRange: [9, 9], explanation: 'Otherwise, record the current number → index mapping for future lookups.' },
  ],
  javascript: [
    { lineRange: [1, 1], explanation: 'Declare the function. JavaScript\'s `Map` gives us O(1) amortized get/set.' },
    { lineRange: [2, 2], explanation: '`seen` is a `Map` (preferred over plain object for integer keys — no prototype pollution risk).' },
    { lineRange: [3, 3], explanation: 'Loop through every index from 0 to nums.length - 1.' },
    { lineRange: [4, 4], explanation: 'Calculate the complement: if we add this to nums[i], we get `target`.' },
    { lineRange: [5, 7], explanation: 'If the complement is in our map, we\'ve found the pair — return its stored index and current `i`.' },
    { lineRange: [8, 8], explanation: 'Record nums[i] → i in the map before moving on.' },
  ],
};

/* ── API functions ───────────────────────────────────────────────────────── */

export async function fetchProblemDetails(input: string): Promise<Problem> {
  await delay(600, 900);
  return resolveProblem(input);
}

export async function analyzeThoughtProcess(
  _problem: Problem,
  _userThought: string,
): Promise<ThoughtFeedback> {
  await delay(800, 1200);
  return {
    correct: [
      {
        id: 'c1',
        text: 'You identified that brute force O(n²) is too slow.',
        detail: 'Checking all pairs with a nested loop gives O(n²) time — correct to reject this for large inputs.',
      },
      {
        id: 'c2',
        text: 'You mentioned using a hash map for faster lookups.',
        detail: 'A hash map reduces lookup time from O(n) linear scan to O(1) amortized — exactly the right direction.',
      },
    ],
    incorrect: [
      {
        id: 'i1',
        text: 'The index tracking logic needs refinement.',
        detail: 'You\'re storing the value as key but need to store the **index** as value: `seen[num] = index`. This lets you retrieve the partner\'s position in O(1) when the complement is found.',
      },
      {
        id: 'i2',
        text: 'You\'re checking the map before inserting — but the order matters.',
        detail: 'Look up the complement first, then insert the current element. This prevents a number from pairing with itself when `target = 2 * num`.',
      },
    ],
    hints: [
      {
        id: 'h1',
        level: 1,
        text: 'Think about what you need to look up quickly for each element you visit.',
      },
      {
        id: 'h2',
        level: 2,
        text: 'For each `num`, you need `target - num` to complete the pair. Can you check for it in O(1)?',
      },
      {
        id: 'h3',
        level: 3,
        text: 'Map each number to its index: `seen[num] = i`. For element `x`, check if `target - x` exists in `seen` before inserting `x`.',
      },
    ],
  };
}

export async function generateThoughtProcess(
  _problem: Problem,
  _language: Language,
): Promise<string> {
  await delay(500, 800);
  return `## Intuition

The simplest approach is to check every pair of numbers — but that's **O(n²)** and too slow for large inputs.

The key insight is: for each number \`x\` we visit, we already know its **complement** (\`target - x\`). Instead of scanning the array again to find it, we can answer "have I seen this complement before?" in **O(1)** using a hash map.

## Approach

We make a single pass through the array. As we visit each element, we:
1. Ask: "Is the complement of this number already in our map?"
2. If **yes** → we found the pair. Return both indices.
3. If **no** → record this number and its index in the map, then move on.

This transforms an O(n²) scan into a single O(n) traversal with O(n) extra space.

## Why check before inserting?

We check the map **before** inserting the current element. This prevents a number from pairing with itself. For example, if \`nums = [3, 5]\` and \`target = 6\`, element \`3\` should not match with itself even though \`6 - 3 = 3\`.`;
}

export async function generateMathProof(
  _problem: Problem,
  _language: Language,
): Promise<MathProof> {
  await delay(700, 1000);
  return {
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    explanation: `**Time Complexity — O(n)**

We traverse the array exactly once. For each element, we perform:
- One hash map lookup: **O(1)** amortized
- One hash map insert: **O(1)** amortized

Total: n iterations × O(1) per iteration = **O(n)**.

**Space Complexity — O(n)**

In the worst case (no pair found until the last element), the hash map holds up to n − 1 entries. Each entry stores one integer key and one integer value, so space scales linearly: **O(n)**.`,
    correctnessProof: `**Claim:** If a valid pair (i, j) with i < j exists, the algorithm returns it.

**Proof by case analysis:**

When we process index **j** (the larger index in the pair):
- \`nums[i]\` was inserted into \`seen\` at index i < j (since we process left to right).
- We compute \`complement = target - nums[j] = nums[i]\`.
- We check \`seen\` for \`nums[i]\` — it is there, mapping to index i.
- We return [i, j]. ✓

**No false positives:** We only return when the complement is in the map and the two indices are distinct (since we insert *after* checking — a number never pairs with itself).`,
  };
}

export async function generateCode(
  _problem: Problem,
  language: Language,
): Promise<{ code: string; steps: CodeStep[] }> {
  await delay(600, 900);
  return {
    code: MOCK_CODE[language],
    steps: MOCK_STEPS[language],
  };
}

export async function sendFollowUp(
  context: ChatContext,
  question: string,
): Promise<string> {
  await delay(500, 800);

  const q = question.toLowerCase();

  if (q.includes('why') && q.includes('check') && q.includes('insert')) {
    return `Great question! We check **before** inserting to avoid a number pairing with itself.

Consider \`nums = [3, 5], target = 6\`. When we visit \`3\`, its complement is also \`3\`. If we inserted first, we'd incorrectly find \`3\` in the map and return \`[0, 0]\` — using the same index twice. Checking first prevents this edge case.`;
  }

  if (q.includes('hash') || q.includes('map') || q.includes('dictionary')) {
    return `A hash map (dictionary in Python, \`HashMap\` in Java, \`Map\` in JavaScript) stores key-value pairs with **O(1) average-case** lookup and insertion.

Internally it computes a hash of the key to find a "bucket" in memory. With a good hash function and low load factor, collisions are rare, giving us the O(1) guarantee we need.`;
  }

  if (context.section === 'mathProof') {
    return `The **O(n)** time bound holds because hash map operations are O(1) amortized — meaning occasional resizing is spread across many insertions, so the average cost per operation is constant.

In the **worst case** (e.g., all elements map to the same hash bucket due to pathological inputs), time degrades to O(n²). In practice, with a good hash function, this essentially never happens.`;
  }

  return `That's a thoughtful question about \`${context.section}\`!

The core idea is that the hash map acts as a **memory of previously seen numbers**. Each time we visit an element, we're asking: "Has any earlier element already prepared the exact complement I need?" If yes — the earlier element "left a note" for us in the map, and we collect it immediately.

This is a classic **complement lookup** pattern that appears in many hash map problems. Once you internalize it, you'll recognize it in problems like 3Sum, 4Sum, and subarray sum variants.`;
}
