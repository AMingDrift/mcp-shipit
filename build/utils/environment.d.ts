/**
 * 检查必要的环境变量是否存在
 * 加载顺序和优先级：
 * 1. 目标项目中的.env.local文件（优先级最高）
 * 2. 目标项目中的.env.development文件（优先级次之）
 * 3. 目标项目中的.env文件（优先级较低）
 * 4. MCP server中填写的env字段（已存在于process.env中，优先级中等）
 * 5. mcp-shipit的.env文件（优先级最低）
 *
 * @param projectRootDir 目标项目根目录
 * @throws {Error} 如果缺少必要的环境变量则抛出错误
 */
export declare function checkEnvironmentVariables(projectRootDir: string): void;
export declare function getEnvironmentVariables(): {
    SHIPIT_GITHUB_TOKEN: string | undefined;
    SHIPIT_GITHUB_OWNER: string | undefined;
    SHIPIT_GITHUB_REPO: string | undefined;
    SHIPIT_GITHUB_TAG: string | undefined;
    SHIPIT_PROXY: string | undefined;
};
