import path from "path";
import { fileURLToPath } from "url";
import { mcpUnshipit } from "../utils/index.js";
async function unshitpit() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const mcpRootDir = path.resolve(__dirname, "../../");
    const targetDir = "downloaded_public";
    const zipFilename = "mcp-upload-amingos_src_api-250930-74310.zip"; // 需要替换为实际上传的文件名
    console.log("Environment variables loaded:", {
        SHIPIT_GITHUB_TOKEN: process.env.SHIPIT_GITHUB_TOKEN
            ? "Loaded (hidden)"
            : "Not loaded",
        SHIPIT_GITHUB_OWNER: process.env.SHIPIT_GITHUB_OWNER,
        SHIPIT_GITHUB_REPO: process.env.SHIPIT_GITHUB_REPO
    });
    try {
        const { extractPath } = await mcpUnshipit(mcpRootDir, targetDir, zipFilename);
        console.log(`Successfully downloaded and extracted ${zipFilename} to ${extractPath}`);
    }
    catch (error) {
        console.error("Unshitpit function failed:", error);
        throw error;
    }
}
// 确保调用 unshitpit 函数并处理其错误
unshitpit().catch((err) => {
    console.error("Unshitpit function failed:", err);
    process.exit(1);
});
//# sourceMappingURL=test-unshipit.js.map