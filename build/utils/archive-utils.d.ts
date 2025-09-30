/**
 * 将目录压缩为zip文件
 * @param sourceDir 要压缩的源目录
 * @param outPath 输出zip文件路径
 * @returns Promise<string> 压缩文件路径
 */
export declare function zipDirectory(sourceDir: string, outPath: string): Promise<string>;
/**
 * 将zip文件解压到指定目录
 * @param zipPath 要解压的zip文件路径
 * @param destDir 解压目标目录
 * @param mode 解压模式: "overwrite" 表示覆盖目标目录, "merge" 表示合并到目标目录
 * @returns Promise<void>
 */
export declare function unzipToDirectory(zipPath: string, destDir: string, mode: "overwrite" | "merge"): Promise<void>;
/**
 * 准备目标目录，如果目标目录存在则重命名为备份目录，并创建新的目标目录
 * @param projectRootDir 项目根目录
 * @param targetDir 目标目录名
 * @returns {string} 目标目录的完整路径
 */
export declare function prepareTargetDirectory(projectRootDir: string, targetDir: string): string;
