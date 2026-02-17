import { Octokit } from "@octokit/rest";

export function parseRepo(full: string): { owner: string; repo: string } {
  const [owner, repo] = full.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid repository slug: ${full}`);
  }
  return { owner, repo };
}

export interface CommitComparisonResult {
  commits: string[];
  baseSha: string;
  headSha: string;
}

/**
 * Fetch commit list between base and head via GitHub API.
 * Use when not in a git checkout (e.g. webhook runner).
 */
export async function getCommitComparison(
  token: string,
  repository: string,
  baseRef: string,
  headRef: string
): Promise<CommitComparisonResult> {
  const octokit = new Octokit({ auth: token });
  const { owner, repo } = parseRepo(repository);

  const { data } = await octokit.repos.compareCommitsWithBasehead({
    owner,
    repo,
    basehead: `${baseRef}...${headRef}`,
  });

  const commits = (data.commits ?? []).map((c) => c.sha ?? "").filter(Boolean);
  return {
    commits,
    baseSha: data.base_commit?.sha ?? baseRef,
    headSha: data.merge_base_commit?.sha ?? headRef,
  };
}
