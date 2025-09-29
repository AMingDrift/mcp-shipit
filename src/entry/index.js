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
    projectRootDir: z.string().describe("The absolute path to the project root directory."),
    targetDir: z.string().describe("The relative path to the target directory from the project root.")
  }
}, async ({ projectRootDir, targetDir }) => {
  // 动态导入 mcpShipit 函数
  const { mcpShipit } = await import("../utils.js");
  const downloadUrl = await mcpShipit(projectRootDir, targetDir);
  return {
    content: [
      {
        type: "text",
        text: `Successfully uploaded ${targetDir} to GitHub Release. Download URL: ${downloadUrl}`
      }
    ],
  };
});

const transport = new StdioServerTransport();
server.connect(transport);

// 确保进程不会过早退出
process.on("SIGINT", () => server.close());
process.on("SIGTERM", () => server.close());