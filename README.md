# mcp-shipit

mcp-shipit 是一个基于 Model Context Protocol (MCP) 的工具，可以将指定的目录打包成 ZIP 文件并上传到 GitHub Release。

## 功能特点

- 将任意目录打包成 ZIP 文件
- 自动上传到 GitHub Release
- 支持创建或复用现有的 Release 标签
- 通过 MCP 协议提供服务，可与其他 MCP 客户端集成

## 环境配置

在使用 mcp-shipit 之前，你需要配置以下环境变量：

1. 复制`.env.example`文件并重命名为 `.env`：

   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填写以下信息：
   - `GITHUB_TOKEN` - 你的 GitHub Personal Access Token
   - `GITHUB_OWNER` - GitHub 仓库的所有者（用户名或组织名）
   - `GITHUB_REPO` - GitHub 仓库的名称

### 获取 GitHub Personal Access Token

1. 访问 GitHub 的 [Personal Access Tokens 页面](https://github.com/settings/tokens)
2. 点击 "Generate new token"
3. 选择适当的权限范围（至少需要 `repo` 权限）
4. 生成并复制 token

## 使用方法

### 启动服务

```bash
pnpm mcp
```

这将启动 MCP 服务器，监听来自客户端的请求。

### 调用上传功能

通过支持 MCP 协议的客户端调用 `upload_to_github_release` 工具，提供以下参数：

- `projectRootDir`: 项目根目录的绝对路径
- `targetDir`: 相对于项目根目录的目标目录路径

示例参数：

```json
{
  "projectRootDir": "/opt/code/wmc/mcp-shipit",
  "targetDir": "public"
}
```

### 测试功能

你也可以直接运行测试来验证功能是否正常：

```bash
pnpm test
```

这将把 [public](file:///opt/code/wmc/mcp-shipit/public) 目录打包并上传到 GitHub Release。

## 调试模式

如果需要调试 MCP 通信，可以使用以下命令启动调试模式：

```bash
pnpm run debug
```

这将启动 [MCP Inspector](file:///opt/code/wmc/mcp-shipit/node_modules/.pnpm/@modelcontextprotocol+inspector@0.1.2/node_modules/@modelcontextprotocol/inspector/dist/index.js)，帮助你查看 MCP 协议的详细通信过程。

## 配置 MCP 服务器

如果你希望在其他项目中使用 mcp-shipit，可以在项目的 MCP 配置文件中添加以下服务器配置：

```json
{
  "mcpServers": {
    "mcp-shipit": {
      "command": "node",
      "args": ["--no-warnings", "/opt/code/wmc/mcp-shipit/src/entry/index.js"]
    }
  }
}
```

## 提示词

请使用 shipit 工具将项目中的 [public/uploads] 目录打包上传到 GitHub Release。

为了调用 shipit 工具，特别是 [mcp_shipit_upload_to_github_release] 函数，您需要按照以下格式编写提示词：

### 基本格式

```
请将 [目录路径] 上传到 GitHub Release。
```

或者更具体地说：

```
请使用 shipit 工具将项目中的 [相对目录路径] 目录打包上传到 GitHub Release。
```

### 实际示例

1. 上传特定目录：

   ```
   请使用 shipit 工具将项目中的 src/_components 目录打包上传到 GitHub Release。
   ```

2. 上传另一个目录：

   ```
   请将 src/server 目录上传到 GitHub Release 并提供下载链接。
   ```

3. 更详细的请求：

   ```
   我想把项目的 src/api 目录压缩并上传到 GitHub Release，然后获取下载链接，请帮我完成这个操作。
   ```

### 关键要素

在编写提示词时，应包含以下关键信息：

1. 明确提及要使用的工具（shipit 或 mcp_shipit_upload_to_github_release）
2. 指定要上传的目录路径（相对于项目根目录）
3. 可以说明期望的结果（如获取下载链接）

这样编写的提示词能够清楚地传达您的意图，使工具能够正确执行上传操作。

## 支持的 MCP 客户端

- [LINGMA](https://marketplace.visualstudio.com/items?itemName=Alibaba-Cloud.tongyi-lingma)
- [TRAE](https://marketplace.visualstudio.com/items?itemName=MarsCode.marscode-extension)

## 工作原理

1. 接收客户端请求，包含要上传的目录信息
2. 将指定目录压缩成 ZIP 文件
3. 查找或创建名为 "mcp-auto-upload" 的 GitHub Release
4. 将 ZIP 文件上传到该 Release
5. 返回文件的下载链接

## 注意事项

- 确保提供的 GitHub Token 具有对目标仓库的写入权限
- 目标目录必须存在且可访问
- 上传的文件会存储在名为 "mcp-auto-upload" 的 Release 中
