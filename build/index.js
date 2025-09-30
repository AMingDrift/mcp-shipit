#!/usr/bin/env node
// 导入必要的类
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod/v3";
export const server = new McpServer({
    name: "mcp-shipit",
    title: "MCP Shipit",
    version: "0.1.0",
    description: "GitHub Release Upload Tool"
});
server.registerTool("upload_to_github_release", {
    title: "Upload to GitHub Release",
    description: "Uploads a specified directory to a GitHub Release as a zip file.",
    inputSchema: {
        projectRootDir: z
            .string()
            .describe("The absolute path to the project root directory."),
        targetDir: z
            .string()
            .describe("The relative path to the target directory from the project root.")
    }
}, async ({ projectRootDir, targetDir }) => {
    // 动态导入 mcpShipit 函数
    const { mcpShipit, setLoggingCallback } = await import("./utils/index.js");
    // 设置日志回调函数，将日志通过 MCP 协议发送给客户端
    setLoggingCallback((message, level) => {
        // 将 "warn" 映射为 "warning" 以匹配 MCP SDK 的 LoggingLevel 类型
        const mcpLevel = level === "warn" ? "warning" : level;
        server.sendLoggingMessage({
            level: mcpLevel,
            data: message
        });
    });
    try {
        const { downloadUrl, zipFilename } = await mcpShipit(projectRootDir, targetDir);
        return {
            content: [
                {
                    type: "text",
                    text: `Successfully uploaded ${targetDir} to GitHub Release. \nDownload URL: \t${downloadUrl}\nZip Filename: \t${zipFilename}`
                }
            ]
        };
    }
    catch (error) {
        server.sendLoggingMessage({
            level: "error",
            data: `Failed to upload directory: ${error.message}`
        });
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to upload ${targetDir} to GitHub Release. Error: ${error.message}`
                }
            ]
        };
    }
});
server.registerTool("download_from_github_release", {
    title: "Download from GitHub Release",
    description: "Downloads a specified file from a GitHub Release and extracts it to a target directory.",
    inputSchema: {
        projectRootDir: z
            .string()
            .describe("The absolute path to the project root directory."),
        targetDir: z
            .string()
            .describe("The relative path to the target directory from the project root."),
        filename: z
            .string()
            .describe("The name of the file to download from GitHub Release."),
        mode: z
            .enum(["overwrite", "merge"])
            .optional()
            .default("overwrite")
            .describe("Download mode: overwrite or merge.")
    }
}, async ({ projectRootDir, targetDir, filename, mode }) => {
    // 动态导入 mcpUnshipit 函数
    const { mcpUnshipit, setLoggingCallback } = await import("./utils/index.js");
    // 设置日志回调函数，将日志通过 MCP 协议发送给客户端
    setLoggingCallback((message, level) => {
        // 将 "warn" 映射为 "warning" 以匹配 MCP SDK 的 LoggingLevel 类型
        const mcpLevel = level === "warn" ? "warning" : level;
        server.sendLoggingMessage({
            level: mcpLevel,
            data: message
        });
    });
    try {
        // 清理文件名，去除回车、换行、空格等无效字符
        const cleanFilename = filename.trim().replace(/[\r\n\t]/g, "");
        const { extractPath } = await mcpUnshipit(projectRootDir, targetDir, cleanFilename, mode);
        return {
            content: [
                {
                    type: "text",
                    text: `Successfully downloaded and extracted ${cleanFilename} to ${extractPath}.`
                }
            ]
        };
    }
    catch (error) {
        server.sendLoggingMessage({
            level: "error",
            data: `Failed to download file: ${error.message}`
        });
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to download ${filename} from GitHub Release. Error: ${error.message}`
                }
            ]
        };
    }
});
const transport = new StdioServerTransport();
server.connect(transport);
// 确保进程不会过早退出
process.on("SIGINT", () => server.close());
process.on("SIGTERM", () => server.close());
//# sourceMappingURL=index.js.map