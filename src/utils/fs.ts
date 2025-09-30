import fs from "fs";
import path from "path";

/**
 * 准备目标目录，如果目标目录存在则重命名为备份目录，并创建新的目标目录
 * @param projectRootDir 项目根目录
 * @param targetDir 目标目录名
 * @returns {string} 目标目录的完整路径
 */
export function prepareTargetDirectory(
    projectRootDir: string,
    targetDir: string
): string {
    // 创建目标目录路径
    const destDir = path.join(projectRootDir, targetDir);
    const destDirBackup = path.join(projectRootDir, `${targetDir}_bak`);
    
    // 如果目标目录存在，则重命名为 {targetDir}_bak
    if (fs.existsSync(destDir)) {
        // 如果备份目录已存在，先删除它
        if (fs.existsSync(destDirBackup)) {
            fs.rmSync(destDirBackup, { recursive: true, force: true });
        }
        // 重命名原目录为备份目录
        fs.renameSync(destDir, destDirBackup);
    }
    
    // 确保目标目录存在
    fs.mkdirSync(destDir, { recursive: true });
    
    return destDir;
}
// 此文件暂时为空，保留以备将来使用
// 所有文件系统相关功能已移至archive-utils.ts或其他相关模块
