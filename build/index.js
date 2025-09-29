// 导入必要的类
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod/v3";
const server = new McpServer({
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
        const downloadUrl = await mcpShipit(projectRootDir, targetDir);
        return {
            content: [
                {
                    type: "text",
                    text: `Successfully uploaded ${targetDir} to GitHub Release. Download URL: ${downloadUrl}`
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
const transport = new StdioServerTransport();
server.connect(transport);
// 确保进程不会过早退出
process.on("SIGINT", () => server.close());
process.on("SIGTERM", () => server.close());
//# sourceMappingURL=index.js.map