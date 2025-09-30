import path from "path";
import { fileURLToPath } from "url";
import { mcpShipit } from "../utils/index.js";
async function main() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const mcpRootDir = path.resolve(__dirname, "../../");
    const targetDir = "public";
    const { downloadUrl, zipFilename } = await mcpShipit(mcpRootDir, targetDir);
    // 添加日志验证环境变量是否加载成功
    console.log("Environment variables loaded:", {
        SHIPIT_GITHUB_TOKEN: process.env.SHIPIT_GITHUB_TOKEN
            ? "Loaded (hidden)"
            : "Not loaded",
        SHIPIT_GITHUB_OWNER: process.env.SHIPIT_GITHUB_OWNER,
        SHIPIT_GITHUB_REPO: process.env.SHIPIT_GITHUB_REPO
    });
    console.log(`Successfully uploaded ${targetDir} to GitHub Release. \nDownload URL: \t${downloadUrl}\nZip Filename: \t${zipFilename}`);
}
// 确保调用 main 函数并处理其错误
main().catch((err) => {
    console.error("Main function failed:", err);
    process.exit(1);
});
//# sourceMappingURL=test-index.js.map