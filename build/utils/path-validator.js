import fs from "fs";
import path from "path";
/**
 * 验证目标目录路径是否有效
 * @param projectRootDir 项目根目录
 * @param targetDir 目标目录（相对于项目根目录）
 * @throws {Error} 如果路径无效或目录不存在则抛出错误
 * @returns 解析后的目标目录路径
 */
export function validateTargetPath(projectRootDir, targetDir) {
    const resolvedPath = path.resolve(projectRootDir, targetDir);
    if (!resolvedPath.startsWith(projectRootDir)) {
        throw new Error("Invalid targetDir path");
    }
    // 添加目录存在检查
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Directory not found: ${targetDir}`);
    }
    return resolvedPath;
}
/**
 * 确保临时目录存在
 * @param projectRootDir 项目根目录
 * @returns 临时目录路径
 */
export function ensureTempDirectory(projectRootDir) {
    const projectTmpDir = path.join(projectRootDir, "tmp");
    if (!fs.existsSync(projectTmpDir)) {
        fs.mkdirSync(projectTmpDir, { recursive: true });
    }
    return projectTmpDir;
}
//# sourceMappingURL=path-validator.js.map