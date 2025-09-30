import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前文件目录的绝对路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mcpRootDir = path.resolve(__dirname, "../../");

// 加载mcp-shipit的.env环境变量（优先级最低）
// 当项目发布到npm上时，项目根目录的.env文件可能不存在，这是正常的
try {
    dotenv.config({
        path: path.resolve(mcpRootDir, ".env"),
        override: false,
        quiet: true
    });
} catch {
    // 静默忽略加载mcp-shipit自身.env文件时的错误
    // 在npm包中，这个文件通常不存在，且不是必需的
    // 不记录日志以避免污染MCP的IO流
}

let SHIPIT_GITHUB_TOKEN: string | undefined;
let SHIPIT_GITHUB_OWNER: string | undefined;
let SHIPIT_GITHUB_REPO: string | undefined;

/**
 * 检查必要的环境变量是否存在
 * 加载顺序和优先级：
 * 1. 目标项目中的.env文件（优先级最高）
 * 2. MCP server中填写的env字段（已存在于process.env中，优先级中等）
 * 3. mcp-shipit的.env文件（优先级最低）
 *
 * @param projectRootDir 目标项目根目录
 * @throws {Error} 如果缺少必要的环境变量则抛出错误
 */
export function checkEnvironmentVariables(projectRootDir: string): void {
    // 从目标项目中的.env文件加载环境变量（优先级最高，可以覆盖其他设置）
    const localEnvPath = path.resolve(projectRootDir, ".env");
    if (fs.existsSync(localEnvPath)) {
        try {
            const localEnv = dotenv.parse(fs.readFileSync(localEnvPath));
            Object.assign(process.env, localEnv);
        } catch {
            // 静默忽略加载目标项目.env文件时的错误，避免污染MCP的IO流
        }
    }

    // 从process.env中获取最终的环境变量值
    // 由于上面的Object.assign操作，目标项目的.env变量会覆盖MCP server env和mcp-shipit的.env
    SHIPIT_GITHUB_TOKEN = process.env.SHIPIT_GITHUB_TOKEN;
    SHIPIT_GITHUB_OWNER = process.env.SHIPIT_GITHUB_OWNER;
    SHIPIT_GITHUB_REPO = process.env.SHIPIT_GITHUB_REPO;

    if (!SHIPIT_GITHUB_TOKEN || !SHIPIT_GITHUB_OWNER || !SHIPIT_GITHUB_REPO) {
        throw new Error(
            `Missing SHIPIT_GITHUB_TOKEN[${
                SHIPIT_GITHUB_TOKEN ? "Loaded (hidden)" : "Not loaded"
            }], SHIPIT_GITHUB_OWNER[${SHIPIT_GITHUB_OWNER}], or SHIPIT_GITHUB_REPO[${SHIPIT_GITHUB_REPO}] in environment`
        );
    }
}

export function getEnvironmentVariables() {
    return {
        SHIPIT_GITHUB_TOKEN,
        SHIPIT_GITHUB_OWNER,
        SHIPIT_GITHUB_REPO
    };
}
