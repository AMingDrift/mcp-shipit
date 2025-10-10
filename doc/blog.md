# 手把手教你从零开发一个自己的MCP服务

在AI编辑器日益普及的今天，我们可以通过自定义工具来扩展AI的能力。本文将介绍如何从零开始开发一个基于[模型上下文协议（MCP）](https://modelcontextprotocol.io/introduction)的工具，并将其发布到npm，让AI能够直接使用它。

## 为什么想到开发这个工具？

在日常开发中，我们经常遇到需要在多个开发环境之间共享测试资源（如图片、视频等大文件）的情况。传统的做法是使用网盘等工具手动上传下载，这个过程繁琐且容易出错。

为了解决这个问题，我开发了[mcp-shipit](https://github.com/AMingDrift/mcp-shipit)工具，它可以让我们通过简单的自然语言指令，让AI编辑器自动将指定目录打包上传到GitHub Release，或者从GitHub Release下载文件并解压到指定位置。

## 什么是MCP？

模型上下文协议（Model Context Protocol，简称MCP）是一种开放协议，允许AI模型与外部工具和服务进行交互。通过MCP，我们可以让AI编辑器调用我们自定义的工具，从而扩展其能力。

## 实现思路

我们的目标是创建一个MCP工具，提供两个核心功能：

1. 将本地目录打包上传到GitHub Release
2. 从GitHub Release下载文件并解压到指定目录

### 项目结构

首先，我们需要创建一个基本的项目结构：

```plaintext
mcp-shipit/
├── src/
│   ├── index.ts                    # 入口文件，定义MCP Server和工具
│   └── utils/                      # 工具实现
│       ├── archive-utils.ts        # 压缩/解压功能
│       ├── environment.ts          # 环境变量处理
│       ├── github-release.ts       # GitHub API交互
│       ├── mcp-shipit.ts           # 上传功能主逻辑
│       ├── mcp-unship-shipit.ts    # 下载功能主逻辑
│       ├── log.ts                  # 日志处理
|       ├── path-validator.ts       # 路径验证
│       └── index.ts                # 工具入口文件
├── package.json
└── tsconfig.json
```

### 创建MCP Server

在入口文件`src/index.ts`中，我们需要初始化MCP Server并注册工具：

```typescript
#!/usr/bin/env node

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

### 注册工具

接下来，我们需要注册可供AI调用的工具。我们提供两个工具：`upload_to_github_release`和`download_from_github_release`。

```typescript
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
        // 工具实现
    }
);

server.registerTool(
    "download_from_github_release",
    ...
);
```

### 实现核心功能

工具的核心实现包括目录压缩、GitHub Release操作等。

- 📦 打包项目目录为 ZIP 文件
- ☁️ 自动上传到 GitHub Release
- 🏷️ 支持创建或复用 Release 标签
- 🔌 通过 MCP 协议集成
- ⬇️ 支持从 GitHub Release 下载并解压
- 🌐 支持代理访问 GitHub API

以下是上传功能的主要流程：

1. 验证环境变量配置
2. 验证目标路径
3. 生成唯一的文件名
4. 压缩目录为ZIP文件
5. 获取或创建GitHub Release
6. 上传ZIP文件到Release
7. 清理临时文件

```typescript
// src/utils/mcp-shipit.ts
export async function mcpShipit(projectRootDir: string, targetDir: string) {
    try {
        // 步骤1: 检查环境变量
        checkEnvironmentVariables(projectRootDir);

        // 步骤2: 验证目标路径
        const resolvedPath = validateTargetPath(projectRootDir, targetDir);

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
        const projectTmpDir = ensureTempDirectory(projectRootDir);
        const tmpZipPath = path.join(projectTmpDir, zipFilename);

        try {
            // 步骤4: 压缩目录
            await zipDirectory(resolvedPath, tmpZipPath);

            // 步骤5: 获取或创建GitHub Release
            const release = await getOrCreateRelease();

            // 步骤6: 上传到GitHub Release
            const downloadUrl = await uploadToRelease(
                release.id,
                tmpZipPath,
                zipFilename
            );

            // 步骤7: 返回下载URL
            return { downloadUrl, zipFilename };
        } finally {
            // 步骤8: 清理临时文件
            if (fs.existsSync(tmpZipPath)) {
                fs.unlinkSync(tmpZipPath);
            }
        }
    } catch (error: any) {
        throw error;
    }
}
```

### 与GitHub交互

#### 前提条件

- Node.js v20+
- GitHub Personal Access Token ([获取指引](https://github.com/settings/tokens/new))

#### GitHub API 权限说明

mcp-shipit 工具需要通过 GitHub API 上传和下载 Release 文件，为此你需要创建一个 Personal Access Token (PAT) 并授予适当权限。

在 [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new) 创建新 token 时，根据你的使用场景选择以下权限：

##### 上传 Release 文件

需要 `repo` 权限（完整控制私有和公有仓库），该权限包含：

- `public_repo`（访问公有仓库）
- 允许创建 release 和上传 release assets

##### 下载 Release 文件

- 公有仓库：`public_repo` 权限
- 私有仓库：`repo` 权限

##### 推荐配置

| 使用场景          | 建议权限  |
| ----------------- | --------- |
| 上传/管理 Release | ✅ `repo` |
| 下载 Release 文件 | ✅ `repo` |

> 📌 为确保功能正常，建议直接选择 `repo` 权限，可同时支持上传和下载操作

我们使用[octokit](https://www.npmjs.com/package/octokit)库与GitHub API进行交互，首先初始化Octokit实例：

```typescript
// src/utils/github-release.ts
function initOctokitInstance() {
    if (!octokit) {
        const { SHIPIT_GITHUB_TOKEN, SHIPIT_PROXY } = getEnvironmentVariables();

        octokit = new Octokit({
            auth: SHIPIT_GITHUB_TOKEN,
            request: SHIPIT_PROXY // 如果配置了代理，则添加代理支持
                ? {
                      fetch: (url: RequestInfo, options: RequestInit) => {
                          logMessage(`Using proxy: ${SHIPIT_PROXY}`, "debug");
                          return undiciFetch(url, {
                              ...options,
                              dispatcher: new ProxyAgent(SHIPIT_PROXY)
                          });
                      }
                  }
                : undefined
        });
    }
}
```

实现Release的创建和文件上传功能：

```typescript
// src/utils/github-release.ts
export async function getOrCreateRelease(tagName?: string) {
    const { SHIPIT_GITHUB_OWNER, SHIPIT_GITHUB_REPO, SHIPIT_GITHUB_TAG } =
        getEnvironmentVariables();

    const tag = tagName || SHIPIT_GITHUB_TAG || "mcp-auto-upload";

    try {
        const { data: release } = await octokit.rest.repos.getReleaseByTag({
            owner: SHIPIT_GITHUB_OWNER!,
            repo: SHIPIT_GITHUB_REPO!,
            tag: tag
        });
        return release;
    } catch (error) {
        if ((error as any).status === 404) {
            const { data: release } = await octokit.rest.repos.createRelease({
                owner: SHIPIT_GITHUB_OWNER!,
                repo: SHIPIT_GITHUB_REPO!,
                tag_name: tag,
                name: "Auto-generated Uploads",
                body: "Managed by MCP tool",
                draft: false,
                prerelease: false
            });
            return release;
        }
        throw error;
    }
}
```

## 发布到npm

为了让其他开发者能够方便地使用我们的工具，我们需要将其发布到npm。

### 配置package.json

在`package.json`中，我们需要进行一些特殊配置以支持MCP工具：

```json
{
    "name": "@amingdrift/mcp-shipit",
    "version": "1.1.0",
    "description": "mcp-shipit is a Model Context Protocol (MCP)-based tool that can package specified directories into a ZIP file and upload them to GitHub Release.",
    "main": "./build/index.js",
    "type": "module",
    "bin": {
        "mcp-shipit": "build/index.js"
    },
    "scripts": {
        "build": "rimraf -rf build && tsc && chmod +x build/index.js",
        "prepublishOnly": "npm run build"
    }
}
```

特别注意以下几点：

1. `"type": "module"` - 使用ES模块
2. `"bin"` - 指定可执行文件，这样用户可以通过`npx`调用
3. `"prepublishOnly"` - 在发布前自动构建

### 构建和发布

执行以下命令构建并发布包：

```bash
npm publish --access public
```

## 集成到AI编辑器

发布到npm后，用户可以通过以下方式在支持MCP的AI编辑器中集成这个工具：

- [VS Code Copilot](https://vscode.js.cn/docs/copilot/customization/mcp-servers#_add-an-mcp-server)
- [通义灵码](https://help.aliyun.com/zh/lingma/user-guide/guide-for-using-mcp#d60f59f38ap5c)
- [Trae](https://docs.trae.ai/ide/model-context-protocol?_lang=zh#0b1e1b2c)

### VS Code Copilot配置示例

```json
{
    "servers": {
        "mcp-shipit": {
            "type": "stdio",
            "command": "npx",
            "args": ["@amingdrift/mcp-shipit"],
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

### Trae配置示例

```json
{
    "mcpServers": {
        "mcp-shipit": {
            "command": "npx",
            "args": ["@amingdrift/mcp-shipit"],
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

**环境变量说明：**

- `SHIPIT_GITHUB_TOKEN` (必需): GitHub 访问令牌
- `SHIPIT_GITHUB_OWNER` (必需): 仓库所有者
- `SHIPIT_GITHUB_REPO` (必需): 仓库名称
- `SHIPIT_GITHUB_TAG` (可选): Release 标签名，默认 `mcp-auto-upload`
- `SHIPIT_PROXY` (可选): 代理地址

> 可在项目根目录 `.env` 文件中设置环境变量，优先级高于配置文件。

## 使用示例

集成完成后，用户可以通过自然语言指令使用工具：

**上传目录：**

```
请使用 mcp-shipit 工具将 public/mock 目录打包上传到 GitHub Release
```

![上传示意图](./upload.png)

**下载文件：**

```
请使用 mcp-shipit 工具将 mcp-upload-project_public-240930-abcde.zip 从 GitHub release 下载到 downloaded_mock 目录
```

![下载示意图](./download.png)

## 注意事项

- 确保 GitHub Token 有仓库写入权限
- 上传目录需存在且可访问
- 下载时同名文件会被覆盖，原目录会备份为 `_bak`
- 网络慢时可配置代理
- 仅测试通过了 VS Code Copilot、通义灵码、Trae 三款 AI 编程工具，其他如 Claude Desktop、Cursor、Continue 可自行尝试
- 必须通过智能体/Agent/Builder with MCP 方式使用本工具，实现自动化工作流

## 总结

通过本文的介绍，我们学习了如何：

1. 创建一个MCP Server并注册自定义工具
2. 实现与GitHub Release的交互功能
3. 将工具发布到npm以便其他人使用
4. 在AI编辑器中集成和使用自定义工具

这种方式让我们能够极大地扩展AI编辑器的能力，将重复性的操作自动化，提高开发效率。你可以基于这个思路开发更多实用的工具，比如数据库操作、文件处理、API调用等。

项目的完整源码可以在GitHub上找到：[https://github.com/AMingDrift/mcp-shipit](https://github.com/AMingDrift/mcp-shipit)

如果你觉得这个工具对你有帮助，欢迎Star项目！

## 参考链接

- [Model Context Protocol](https://modelcontextprotocol.io/introduction)
- [Github上精选的 MCP 服务器](https://github.com/punkpeye/awesome-mcp-servers/blob/main/README-zh.md)
