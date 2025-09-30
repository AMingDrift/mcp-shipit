# mcp-shipit

mcp-shipit 是一个基于 Model Context Protocol (MCP) 的工具，可以将指定的目录打包成 ZIP 文件并上传到 GitHub Release。

## 功能特点

- 将任意目录打包成 ZIP 文件
- 自动上传到 GitHub Release
- 支持创建或复用现有的 Release 标签
- 通过 MCP 协议提供服务，可与其他 MCP 客户端集成
- 支持从 GitHub Release 下载文件并解压到指定目录
- 支持通过代理访问 GitHub API

## 环境配置

在使用 mcp-shipit 之前，你需要配置以下环境变量：

1. 复制`.env.example`文件并重命名为 `.env`：

    ```bash
    cp .env.example .env
    ```

2. 编辑 `.env` 文件，填写以下信息：
    - `SHIPIT_GITHUB_TOKEN` - 你的 GitHub Personal Access Token
    - `SHIPIT_GITHUB_OWNER` - GitHub 仓库的所有者（用户名或组织名）
    - `SHIPIT_GITHUB_REPO` - GitHub 仓库的名称
    - `SHIPIT_PROXY` - （可选）代理服务器地址，格式如 `http://127.0.0.1:1080` 或 `socks5://127.0.0.1:1080`

### 获取 GitHub Personal Access Token

1. 访问 GitHub 的 [Personal Access Tokens 页面](https://github.com/settings/tokens)
2. 点击 "Generate new token"
3. 选择适当的权限范围（至少需要 `repo` 权限）
4. 生成并复制 token

## 使用方法

### 安装

```bash
npm install @amingdrift/mcp-shipit
```

### 启动服务

```bash
pnpm start
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

### 调用下载功能

通过支持 MCP 协议的客户端调用 `download_from_github_release` 工具，提供以下参数：

- `projectRootDir`: 项目根目录的绝对路径
- `targetDir`: 相对于项目根目录的目标目录路径
- `filename`: 要从 GitHub Release 下载的文件名
- `mode`: 下载模式，可选值为 "overwrite"（覆盖，默认值）或 "merge"（合并）

示例参数：

```json
{
    "projectRootDir": "/opt/code/wmc/mcp-shipit",
    "targetDir": "downloaded_public",
    "filename": "mcp-upload-mcp-shipit_public-240930-69a62.zip",
    "mode": "merge"
}
```

下载模式说明：
- `overwrite`: 覆盖模式，会先备份现有目录（添加 `_bak` 后缀），然后删除原目录内容再解压
- `merge`: 合并模式，保留目标目录中独有的文件，同名文件会被新文件覆盖

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
            "command": "npx",
            "args": ["@amingdrift/mcp-shipit"]
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

### 下载提示词

要使用 download_from_github_release 工具，您可以按照以下格式编写提示词：

```
请使用 download_from_github_release 工具从 GitHub Release 下载文件到我的项目中。

参数如下：
- projectRootDir: /path/to/my/project
- targetDir: public/downloads
- filename: my-assets.zip
- mode: merge

这将把文件下载到我的项目中的 public/downloads 目录，并与现有文件合并。
```

或者更简洁的版本：

```
请使用 download_from_github_release 工具下载文件。

项目根目录：/home/user/my-project
目标目录：assets
文件名：latest-build.zip
模式：overwrite（覆盖现有文件）
```

### 代理配置提示

如果遇到 GitHub 访问缓慢的问题，可以配置代理来加速访问：

1. 在 `.env` 文件中添加代理配置：
   ```
   SHIPIT_PROXY=http://127.0.0.1:1080
   ```

2. 或者在运行时通过环境变量设置：
   ```bash
   SHIPIT_PROXY=http://127.0.0.1:1080 pnpm start
   ```

支持的代理格式包括：
- HTTP 代理: `http://127.0.0.1:1080`
- HTTPS 代理: `https://127.0.0.1:1080`
- SOCKS 代理: `socks5://127.0.0.1:1080`

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

对于下载功能：
1. 接收客户端请求，包含要下载的文件信息
2. 从指定的 GitHub Release 下载 ZIP 文件到临时目录
3. 根据模式参数准备目标目录（备份现有目录）
4. 将 ZIP 文件解压到目标目录
5. 返回解压完成的信息

## 注意事项

- 确保提供的 GitHub Token 具有对目标仓库的写入权限
- 目标目录必须存在且可访问
- 上传的文件会存储在名为 "mcp-auto-upload" 的 Release 中
- 下载时确保文件名正确，避免包含多余的空格或换行符
- 在覆盖模式下，现有目标目录会被备份（添加 `_bak` 后缀）
- 在合并模式下，目标目录中的独有文件会被保留
- 如果遇到网络访问缓慢问题，可以配置代理加速 GitHub API 访问