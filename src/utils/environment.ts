import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前文件目录的绝对路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mcpRootDir = path.resolve(__dirname, "../../");

// 加载环境变量
dotenv.config({
    path: path.resolve(mcpRootDir, ".env"),
    override: false,
    quiet: true
});

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
export const GITHUB_OWNER = process.env.GITHUB_OWNER;
export const GITHUB_REPO = process.env.GITHUB_REPO;

/**
 * 检查必要的环境变量是否存在
 * @throws {Error} 如果缺少必要的环境变量则抛出错误
 */
export function checkEnvironmentVariables(): void {
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        throw new Error(
            "Missing GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO in environment"
        );
    }
}
