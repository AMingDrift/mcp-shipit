import { setLoggingCallback } from "./log.js";
export { setLoggingCallback };
/**
 * 从GitHub Release下载文件并解压到目标目录
 * @param projectRootDir 项目根目录
 * @param targetDir 目标目录
 * @param filename 要下载的文件名（如 xxx.zip）
 * @param mode 解压模式: "overwrite" 表示覆盖目标目录, "merge" 表示合并到目标目录
 * @returns Promise<{ extractPath: string }> 解压后的目录路径
 */
export declare function mcpUnshipit(projectRootDir: string, targetDir: string, filename: string, mode?: "overwrite" | "merge"): Promise<{
    extractPath: string;
}>;
