import { execCommand } from "./exec";

const defaultCwd = process.cwd();

/** Resolve default base/head when not provided. Uses GITHUB_* in CI, else merge-base(main, headRef)..headRef. */
export async function resolveDefaultBaseHead(
  headRef: string = process.env.GITHUB_SHA ?? "HEAD",
  cwd = defaultCwd
): Promise<{ baseSha: string; headSha: string }> {
  const headSha = headRef;
  const baseSha = process.env.GITHUB_BASE_SHA;

  if (baseSha) {
    return { baseSha, headSha };
  }

  for (const branch of ["origin/main", "origin/master", "main", "master"]) {
    const res = await execCommand(`git merge-base ${branch} ${headRef}`, cwd);
    if (res.exitCode === 0 && res.stdout.trim()) {
      return { baseSha: res.stdout.trim(), headSha };
    }
  }

  const fallback = await execCommand(`git rev-parse ${headRef}^`, cwd);
  if (fallback.exitCode === 0 && fallback.stdout.trim()) {
    return { baseSha: fallback.stdout.trim(), headSha };
  }

  return { baseSha: headSha, headSha };
}

export async function gitChangedPaths(
  baseSha: string,
  headSha: string,
  cwd = defaultCwd
): Promise<string[]> {
  const res = await execCommand(
    `git diff --name-only ${baseSha} ${headSha}`,
    cwd
  );
  if (res.exitCode !== 0) {
    throw new Error(`Unable to compute changed paths: ${res.stderr}`);
  }
  return res.stdout
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function gitDiffSummary(
  baseSha: string,
  headSha: string,
  cwd = defaultCwd
): Promise<string> {
  const res = await execCommand(`git diff --stat ${baseSha} ${headSha}`, cwd);
  if (res.exitCode !== 0) {
    throw new Error(`Unable to compute diff summary: ${res.stderr}`);
  }
  return res.stdout.trim();
}

export async function gitCommitList(
  baseSha: string,
  headSha: string,
  cwd = defaultCwd
): Promise<string[]> {
  const res = await execCommand(
    `git log --pretty=format:%H ${baseSha}..${headSha}`,
    cwd
  );
  if (res.exitCode !== 0) {
    return [];
  }
  return res.stdout
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}
