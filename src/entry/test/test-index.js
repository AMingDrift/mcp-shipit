import path from "path";
import { fileURLToPath } from "url";
import { mcpShipit } from "../../utils.js";

async function main() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const mcpRootDir = path.resolve(__dirname, '../../../');
    const downloadUrl = await mcpShipit(mcpRootDir, 'public');
    // 添加日志验证环境变量是否加载成功
    console.log('Environment variables loaded:', {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? 'Loaded (hidden)' : 'Not loaded',
      GITHUB_OWNER: process.env.GITHUB_OWNER,
      GITHUB_REPO: process.env.GITHUB_REPO
    });
    console.log('Uploaded successfully! Download URL:', downloadUrl);
}

// 确保调用 main 函数并处理其错误
main().catch(err => {
  console.error('Main function failed:', err);
  process.exit(1);
});