export declare const GITHUB_TOKEN: string | undefined;
export declare const GITHUB_OWNER: string | undefined;
export declare const GITHUB_REPO: string | undefined;
/**
 * 检查必要的环境变量是否存在
 * @throws {Error} 如果缺少必要的环境变量则抛出错误
 */
export declare function checkEnvironmentVariables(): void;
