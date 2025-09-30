### 配置文件

```json
{
    "mcpServers": {
        "mcp-shipit": {
            "command": "npx",
            "args": ["@amingdrift/mcp-shipit"],
            "env": {
                "SHIPIT_GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                "SHIPIT_GITHUB_OWNER": "AMingDrift",
                "SHIPIT_GITHUB_REPO": "AMingOS"
            }
        }
    }
}
```

### 提示词

```
请使用 mcp-shipit 工具将项目中的 [public/uploads] 目录打包上传到 GitHub Release。
```

```
请使用 mcp-shipit的download工具下载[mcp-upload-amingos_src_database_fixture_creative-250930-7800e.zip]到[public/assets_bak]目录中覆盖
```

### @modelcontextprotocol/inspector测试

#### projectRootDir\*

/opt/code/wmc/mcp-shipit/

#### targetDir\*

public
