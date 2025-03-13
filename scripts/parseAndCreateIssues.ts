import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";
import { config } from "dotenv";
config(); // Load environment variables from .env file if present

// Pull repository info from GitHub Actions environment.
const repository = process.env.GITHUB_REPOSITORY;
if (!repository) {
  console.error("GITHUB_REPOSITORY is not defined in the environment.");
  process.exit(1);
}
const [OWNER, REPO] = repository.split("/");

// Get the GitHub token from the environment.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN is not defined in the environment.");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Path to the missing_info.md file
const missingInfoPath = path.join(process.cwd(), "missing_info.md");
if (!fs.existsSync(missingInfoPath)) {
  console.error("missing_info.md not found.");
  process.exit(1);
}

const reportContent = fs.readFileSync(missingInfoPath, "utf8");

// Helper to capitalize a string.
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Helper to format a comma-separated list of missing files as a markdown checkbox list.
function formatDetailsAsTasks(details: string): string {
  const files = details
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (files.length === 0) return "- [ ] No details provided";
  return files.map((file) => `- [ ] ${file}`).join("\n");
}

function normalize(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ");
}

/**
 * Parses the markdown report and returns a mapping of issue titles to their details.
 *
 * The report is expected to have sections starting with "##" headings.
 * For each section that has missing items (lines starting with "-"),
 * we extract the Pokémon id, filePath, and optionally the missing details.
 */
function parseReport(
  content: string
): Map<string, { header: string; filePath: string; details: string }> {
  const issuesMap = new Map<
    string,
    { header: string; filePath: string; details: string }
  >();

  // Split the report into sections (skipping the top-level header).
  const sections = content.split("\n## ").slice(1);
  for (const section of sections) {
    const lines = section.split("\n");
    const header = lines[0].trim();

    // TODO: Remove this once animations are reliable.
    if (header == "Missing Pokémon Animations") continue;

    const body = lines.slice(1).join("\n").trim();

    // Skip section if no missing items are reported.
    if (/no pokemon .*!/i.test(body)) continue;

    // Use a regex that makes the details (after the colon) optional.
    // It matches:
    // - [pokemonId](filePath): details
    // or just:
    // - [pokemonId](filePath)
    const regex = /-\s+\[([^\]]+)\]\(([^\)]+)\)(?::\s*(.+))?/;

    // Process each line that starts with "-"
    for (const line of lines) {
      if (!line.trim().startsWith("-")) continue;
      const match = line.match(regex);
      if (!match) {
        console.warn(`Unable to parse line: ${line}`);
        continue;
      }
      const pokemonId = match[1].trim();
      const filePath = match[2].trim();
      // Use an empty string if details are missing.
      const details = match[3]?.trim() || "";

      // Construct an issue title (e.g., "Venusaur Missing Pokemon Textures").
      const issueTitle = `${capitalize(pokemonId)} ${header}`;

      issuesMap.set(issueTitle, { header, filePath, details });
    }
  }
  return issuesMap;
}

/**
 * Creates a new GitHub issue or updates an existing one if its body differs.
 */
async function createOrUpdateIssue(
  currentIssues: Awaited<ReturnType<typeof octokit.issues.listForRepo>>["data"],
  issueTitle: string,
  issueBody: string
): Promise<void> {
  const existingIssue = currentIssues.find(
    (issue) => issue.title == issueTitle
  );
  if (existingIssue) {
    // If the existing issue's body differs from the new body, update it.
    if (normalize(existingIssue.body) !== normalize(issueBody)) {
      console.log(`Updating issue: ${issueTitle}`);
      await octokit.issues.update({
        owner: OWNER,
        repo: REPO,
        issue_number: existingIssue.number,
        body: issueBody,
      });
    } else {
      console.log(`No update needed for issue: ${issueTitle}`);
    }
    return;
  }

  // Otherwise, create a new issue.
  const { data: newIssue } = await octokit.issues.create({
    owner: OWNER,
    repo: REPO,
    title: issueTitle,
    body: issueBody,
    labels: ["auto-sync", "missing-info"],
  });
  console.log(`Created issue: ${issueTitle} (${newIssue.html_url})`);
}

/**
 * Closes any open auto-sync issues that are no longer reported.
 */
async function closeResolvedIssues(
  openIssues: Awaited<ReturnType<typeof octokit.issues.listForRepo>>["data"],
  validIssueTitles: Set<string>
): Promise<void> {
  for (const issue of openIssues) {
    if (validIssueTitles.has(issue.title)) continue;
    console.log(`Closing resolved issue: ${issue.title}`);
    await octokit.issues.update({
      owner: OWNER,
      repo: REPO,
      issue_number: issue.number,
      state: "closed",
    });
  }
}

/**
 * Main function to parse the report, then create or update issues accordingly,
 * and finally close any issues no longer reported.
 */
async function main(): Promise<void> {
  const issuesMap = parseReport(reportContent);
  const validIssueTitles = new Set<string>();
  if (issuesMap.size === 0) return;

  // List open issues labeled "auto-sync" and "missing-info".
  const issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner: OWNER,
    repo: REPO,
    state: "open",
    labels: "auto-sync,missing-info",
    per_page: 100,
  });

  for (const [
    issueTitle,
    { header, filePath, details },
  ] of issuesMap.entries()) {
    validIssueTitles.add(issueTitle);
    const githubUrl = `https://github.com/${OWNER}/${REPO}/blob/main/${filePath}`;
    const issueBody = `### ${header}

${details ? "**Missing Details:**\n" + formatDetailsAsTasks(details) : ""}

**File Path:** [${filePath}](${githubUrl})

_This issue was automatically generated based on the latest missing_info report._`;

    await createOrUpdateIssue(issues, issueTitle, issueBody);
  }

  await closeResolvedIssues(issues, validIssueTitles);
}

main().catch((error) => {
  console.error("Error processing issues:", error);
  process.exit(1);
});
