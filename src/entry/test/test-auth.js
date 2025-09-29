// test-auth.ts
import { Octokit } from "octokit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mcpRootDir = path.resolve(__dirname, '../../../');
dotenv.config({ path: path.resolve(mcpRootDir, '.env'), quiet: true });

// 确保环境变量存在
if (!process.env.GITHUB_TOKEN) {
  // console.error('Error: GITHUB_TOKEN is not set in environment variables');
  process.exit(1);
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  log: console // 添加日志以便查看请求/响应
});

async function testAuth() {
  try {
    // console.log('Attempting to authenticate with GitHub API...');
    const user = await octokit.rest.users.getAuthenticated();
    // console.log('Authentication successful! Authenticated as:', user.data.login);
  } catch (error) {
    // console.error('Authentication failed:');
    // console.error('Error message:', (error as any).message);
    // console.error('Error status:', (error as any).status);
    // console.error('Full error object:', error);
  }
}

testAuth();