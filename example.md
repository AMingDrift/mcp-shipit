### 配置文件

```json
{
    "mcpServers": {
        "mcp-shipit": {
            "command": "npx",
            "args": ["@amingdrift/mcp-shipit"],
            "env": {
                "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                "GITHUB_OWNER": "AMingDrift",
                "GITHUB_REPO": "AMingOS"
            }
        }
    }
}
```

### 提示词

```
请使用 mcp-shipit 工具将项目中的 [public/uploads] 目录打包上传到 GitHub Release。
```

### @modelcontextprotocol/inspector测试

#### projectRootDir\*

/opt/code/wmc/mcp-shipit/

#### targetDir\*

public
