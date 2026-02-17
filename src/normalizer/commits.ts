import path from "node:path";
import fs from "node:fs";
import {
  gitCommitList,
  gitDiffSummary,
  resolveDefaultBaseHead,
} from "../utils/git";

export interface CommitInfo {
  commits: string[];
  diffSummary: string;
  baseSha: string;
  headSha: string;
}

/**
 * Fetch recent commits and diff summary from local git (repoRoot).
 */
export async function fetchCommitsFromGit(
  repoRoot: string,
  commitDepth: number
): Promise<CommitInfo> {
  const { baseSha, headSha } = await resolveDefaultBaseHead("HEAD", repoRoot);
  const commits = await gitCommitList(baseSha, headSha, repoRoot);
  const limited = commits.slice(0, commitDepth);
  const diffSummary = await gitDiffSummary(baseSha, headSha, repoRoot);
  return {
    commits: limited,
    diffSummary,
    baseSha,
    headSha,
  };
}

/**
 * Check if we are in a git repo (has .git).
 */
export function isGitRepo(cwd: string): boolean {
  const gitDir = path.join(cwd, ".git");
  try {
    return fs.existsSync(gitDir);
  } catch {
    return false;
  }
}
