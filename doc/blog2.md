---

# 用 MCP 扩展 AI 编辑器：实现开发资源自动同步的实践

> **摘要**：随着 AI 编辑器（如 Copilot、通义灵码、Trae）的普及，如何让 AI 安全、可靠地操作本地文件和远程服务成为新挑战。本文基于开放协议 **Model Context Protocol (MCP)**，手把手教你构建一个可复用的工具框架，实现“通过自然语言指令自动同步开发资源到 GitHub Release”。我们将重点探讨 MCP 工具的设计原则、安全边界与集成方式，帮助你扩展 AI 的能力边界。

> **标签建议**：`#AI编程 #MCP #GitHub #开发效率 #工具开发 #前端工程化`
---

## 一、背景：AI 编辑器的能力边界在哪里？

当前主流 AI 编辑器（如 GitHub Copilot、通义灵码）虽能生成代码、解释逻辑，但**无法直接操作本地文件系统或调用外部服务**。例如：

- “把 `public/mock` 目录打包上传到 GitHub Release”
- “从最新 Release 下载测试数据并解压到 `assets/`”

这类需求在团队协作、跨环境调试中非常常见，但传统做法依赖手动操作或脚本，效率低且易出错。

**Model Context Protocol（MCP）** 正是为解决这一问题而生——它定义了一套标准协议，允许 AI 模型通过“工具调用”（Tool Calling）与外部服务安全交互。

---

## 二、MCP 是什么？为什么值得尝试？

MCP（Model Context Protocol）是一个轻量级、语言无关的协议，核心思想是：

> **AI 提出需求 → 工具执行操作 → 返回结构化结果**

其优势包括：

- **安全隔离**：工具运行在用户本地，AI 仅传递参数
- **可扩展**：很多 CLI 工具均可封装为 MCP Server
- **标准化**：统一输入/输出格式，便于多编辑器集成

目前，VS Code Copilot、通义灵码、Trae 等均已支持 MCP，生态正在快速成长。

---

## 三、实战目标：让 AI 自动同步开发资源

我们以一个**典型场景**为例：

> **“通过自然语言指令，将指定目录打包上传至 GitHub Release，或从 Release 下载解压”**

你可以基于**相同模式**实现数据库备份、日志分析、API 压测等。

---

## 四、MCP 工具开发四要素

开发一个健壮的 MCP 工具，需关注以下几个核心环节：

### 1. 定义自己的 MCP Server

使用官方 SDK 快速搭建 Server：

```ts
#!/usr/bin/env node
// src/index.ts

// 导入必要的类
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod/v3";
import packageJson from "../package.json" with { type: "json" };

export const server = new McpServer({
    name: "mcp-shipit",
    title: "MCP Shipit",
    version: packageJson.version,
    description: "GitHub Release Upload Tool"
});
```

### 2. 定义清晰的输入 Schema

使用 `zod` 严格校验 AI 传入的参数，避免路径穿越或非法操作：

```ts
// 工具输入定义
// src/index.ts
...
inputSchema: {
    projectRootDir: z
        .string()
        .describe("The absolute path to the project root directory."),
    targetDir: z
        .string()
        .describe(
            "The relative path to the target directory from the project root."
        )
}
...
```

> ✅ **最佳实践**：所有路径必须基于 `projectRootDir`，禁止使用 `..` 或绝对路径。

---

### 3. 注册工具到MCP Server

```ts
// src/index.ts
server.registerTool(
    "upload_to_github_release",
    {
        title: "Upload to GitHub Release",
        description:
            "Uploads a specified directory to a GitHub Release as a zip file.",
        inputSchema: {
            projectRootDir: z
                .string()
                .describe("The absolute path to the project root directory."),
            targetDir: z
                .string()
                .describe(
                    "The relative path to the target directory from the project root."
                )
        }
    },
    async ({ projectRootDir, targetDir }) => {
        // 动态导入 mcpShipit 函数
        const { mcpShipit, setLoggingCallback } = await import(
            "./utils/index.js"
        );

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
            const { downloadUrl, zipFilename } = await mcpShipit(
                projectRootDir,
                targetDir
            );
            return {
                content: [
                    {
                        type: "text",
                        text: `Successfully uploaded ${targetDir} to GitHub Release. \nDownload URL: \t${downloadUrl}\nZip Filename: \t${zipFilename}`
                    }
                ]
            };
        } catch (error: any) {
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
    }
);
```

### 4. 实现原子化、幂等的操作逻辑

以“上传目录”为例，流程需保证**可重试、无副作用**：

```ts
// src/utils/mcp-shipit.ts
export async function mcpShipit(projectRootDir: string, targetDir: string) {
    try {
        logMessage(
            `Starting mcpShipit process for target directory: ${targetDir}`,
            "info"
        );

        // 步骤1: 检查环境变量
        logMessage("Checking environment variables", "debug");
        checkEnvironmentVariables(projectRootDir);
        logMessage("Environment variables check passed", "debug");

        // 步骤2: 验证目标路径
        logMessage(`Validating target path: ${targetDir}`, "debug");
        const resolvedPath = validateTargetPath(projectRootDir, targetDir);
        logMessage("Target path validation passed", "debug");

        // 步骤3: 生成文件名和路径
        const nanoid = customAlphabet("1234567890abcdef", 5);
        const projectRootBaseName = path.basename(projectRootDir);
        const normalizedTargetDir = targetDir.replace(/[/\\]/g, "_");
        const dateTime = new Date()
            .toLocaleDateString("zh-CN", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit"
            })
            .replace(/\//g, "");
        const zipFilename = `mcp-upload-${projectRootBaseName}_${normalizedTargetDir}-${dateTime}-${nanoid()}.zip`;
        logMessage(`Generated zip filename: ${zipFilename}`, "debug");
        const projectTmpDir = ensureTempDirectory(projectRootDir);
        const tmpZipPath = path.join(projectTmpDir, zipFilename);
        logMessage(`Temporary zip path: ${tmpZipPath}`, "debug");

        try {
            // 步骤4: 压缩目录
            logMessage(`Compressing directory: ${targetDir}`, "info");
            await zipDirectory(resolvedPath, tmpZipPath);
            logMessage(`Directory compression completed: ${targetDir}`, "info");

            // 步骤5: 获取或创建GitHub Release
            logMessage("Getting or creating GitHub Release", "info");
            const release = await getOrCreateRelease();
            logMessage(`GitHub Release ready: ${release.id}`, "info");

            // 步骤6: 上传到GitHub Release
            logMessage(`Uploading to GitHub Release: ${zipFilename}`, "info");
            const downloadUrl = await uploadToRelease(
                release.id,
                tmpZipPath,
                zipFilename
            );
            logMessage(
                `Upload completed. Download URL: ${downloadUrl}`,
                "info"
            );

            // 步骤7: 返回下载URL
            return { downloadUrl, zipFilename };
        } catch (error: any) {
            logMessage(`Error during operation: ${error.message}`, "error");
            throw error;
        } finally {
            // 步骤8: 清理临时文件
            logMessage(`Cleaning up temporary file: ${tmpZipPath}`, "debug");
            if (fs.existsSync(tmpZipPath)) {
                fs.unlinkSync(tmpZipPath);
                logMessage("Temporary file cleaned up", "debug");
            }
        }
    } catch (error: any) {
        logMessage(`mcpShipit process failed: ${error.message}`, "error");
        throw error;
    }
}
```

> ✅ **关键点**：
>
> - 压缩包这类临时文件放在项目 `tmp/` 目录下
> - 上传时校检文件路径

---

### 5. 安全访问外部服务（以 GitHub 为例）

通过环境变量注入敏感信息，并支持代理：

```ts
// 初始化 Octokit（支持代理）
const octokit = new Octokit({
    auth: process.env.SHIPIT_GITHUB_TOKEN,
    request: process.env.SHIPIT_PROXY
        ? { fetch: createProxyFetch(process.env.SHIPIT_PROXY) }
        : undefined
});
```

> 🔐 **权限建议**：
>
> - 上传/管理 Release：需 `repo` 权限
> - 仅下载公有仓库：`public_repo` 即可
> - **切勿在代码中硬编码 Token！**

---

### 6. 启动服务

```ts
// src/index.ts
const transport = new StdioServerTransport();
server.connect(transport);
```

### 7. 测试

官方提供了web inspector 来在网页中查看 MCP 的运行结果。

```bash
npx @modelcontextprotocol/inspector
or
pnpm dlx @modelcontextprotocol/inspector
```

---

## 五、如何集成到 AI 编辑器 （以 VS Code Copilot 为例）

可以把代码编译成js后本地运行，或者发布到npm后使用 npx 运行。

MCP 工具通过 **stdio（标准输入输出）** 与编辑器通信。

```json
// .vscode/mcp.json
{
    "servers": {
        "mcp-shipit": {
            "type": "stdio",
            "command": "npx",
            "args": ["@your-scope/your-mcp-tool-package"],
            "env": {
                "SHIPIT_GITHUB_TOKEN": "your-token",
                "SHIPIT_GITHUB_OWNER": "your-owner",
                "SHIPIT_GITHUB_REPO": "your-repo",
                "SHIPIT_PROXY": "your-proxy"
            }
        }
    }
}
```

如果是本地运行，则将 `command` 设置为 `node`，args 设置为 `[path/to/your/mcp-tool.js]`。

> 🌐 **兼容性**：同一工具可无缝用于 Copilot、通义灵码、Trae 等支持 MCP 的平台。

---

## 六、使用效果：自然语言驱动自动化

配置完成后，你可以在编辑器中直接说：

> “请将 `public/mock` 目录打包上传到 GitHub Release”

AI 会自动调用你的工具，返回下载链接。整个过程**无需离开编辑器**，且操作可审计、可回溯。

---

## 七、可复用的经验总结

通过本次实践，我们提炼出 MCP 工具开发的通用模式：

| 环节         | 关键点                                            |
| ------------ | ------------------------------------------------- |
| **输入设计** | 用 zod 严格校验，限制路径范围                     |
| **错误处理** | 返回结构化错误信息（非 throw），便于 AI 理解      |
| **分发方式** | 发布为 npm 包，支持 `npx` 即开即用                |
| **集成方式** | 通过 stdio 与编辑器通信，支持 VS Code、Copilot 等 |

> 💡 **延伸思考**：你还可以用 MCP 实现——
>
> - 数据库快照备份
> - 日志分析
> - API 压测

---

## 八、结语

MCP 不是一个“玩具协议”，而是**连接 AI 与真实开发工作流的桥梁**。通过封装原子化、安全的工具，我们可以让 AI 从“代码生成器”升级为“开发协作者”。

本文的完整实现参考了一个开源示例（[GitHub 链接](https://github.com/AMingDrift/mcp-shipit)），但**核心价值在于方法论**——你可以基于此模式，构建属于自己的 MCP 工具生态。

> 📚 **延伸阅读**
>
> - [Model Context Protocol 官方文档](https://modelcontextprotocol.io)
> - [Github上精选的 MCP 服务器](https://github.com/punkpeye/awesome-mcp-servers/blob/main/README-zh.md)
