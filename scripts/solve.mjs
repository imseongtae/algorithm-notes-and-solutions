import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PLATFORM_ALIASES = {
  leet: 'leetcode',
  leetcode: 'leetcode',
  boj: 'baekjoon',
  baekjoon: 'baekjoon',
  pg: 'programmers',
  programmers: 'programmers',
  aoc: 'advent-of-code',
  'advent-of-code': 'advent-of-code',
};

function usage() {
  console.log(`
사용법:
  pnpm solve <platform?> <problem-id-or-slug>

예시:
  pnpm solve leet 0121-best-time-to-buy-and-sell-stock
  pnpm solve boj 1000
  pnpm solve pg 42576-participant
  pnpm leet 0121-best-time-to-buy-and-sell-stock   # 숏컷
  pnpm boj 1000                                     # 숏컷

플랫폼:
  leet|leetcode, boj|baekjoon, pg|programmers, aoc|advent-of-code

플랫폼 생략 시 기본값: leet
`);
}

const [, , arg1, arg2] = process.argv;
let platformKey = arg2 ? arg1 : 'leet';
let problem = arg2 ? arg2 : arg1;

if (!problem) {
  usage();
  process.exit(1);
}

const platform = PLATFORM_ALIASES[platformKey];
if (!platform) {
  console.error(`❌ 지원하지 않는 플랫폼: ${platformKey}`);
  usage();
  process.exit(1);
}

// 문제 경로 규칙
// - leetcode: platforms/leetcode/<slug>/index.ts
// - baekjoon: platforms/baekjoon/<number>/index.ts  (권장 구조)
// - programmers: platforms/programmers/<slug-or-number>/index.ts
// - advent-of-code: platforms/advent-of-code/<year-day>/index.ts (예: 2023-01)
const baseDir = join(process.cwd(), 'platforms', platform, problem);
const entryCandidates = [
  'index.ts',
  'main.ts',
  `${problem}.ts`,         // 경우에 따라 파일명이 폴더명과 동일한 패턴을 쓰고 싶을 때 대비
];

let entry;
for (const cand of entryCandidates) {
  const full = join(baseDir, cand);
  if (existsSync(full)) {
    entry = full;
    break;
  }
}

if (!entry) {
  console.error(`❌ 엔트리 파일을 찾을 수 없습니다.
- 확인한 위치: ${baseDir}/(${entryCandidates.join(' | ')})
- 문제 폴더/파일을 생성했는지 확인하세요.`);
  process.exit(1);
}

// console.log(`🚀 실행: ${entry}`);
execSync(`node -r ts-node/register -r tsconfig-paths/register "${entry}"`, {
  stdio: 'inherit',
});
