/**
 * 准备目标目录，如果目标目录存在则重命名为备份目录，并创建新的目标目录
 * @param projectRootDir 项目根目录
 * @param targetDir 目标目录名
 * @returns {string} 目标目录的完整路径
 */
export declare function prepareTargetDirectory(projectRootDir: string, targetDir: string): string;
