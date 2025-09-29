/**
 * 验证目标目录路径是否有效
 * @param projectRootDir 项目根目录
 * @param targetDir 目标目录（相对于项目根目录）
 * @throws {Error} 如果路径无效或目录不存在则抛出错误
 * @returns 解析后的目标目录路径
 */
export declare function validateTargetPath(projectRootDir: string, targetDir: string): string;
/**
 * 确保临时目录存在
 * @param projectRootDir 项目根目录
 * @returns 临时目录路径
 */
export declare function ensureTempDirectory(projectRootDir: string): string;
