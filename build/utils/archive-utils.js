import archiver from "archiver";
import fs from "fs";
import path from "path";
import unzipper from "unzipper";
/**
 * 将目录压缩为zip文件
 * @param sourceDir 要压缩的源目录
 * @param outPath 输出zip文件路径
 * @returns Promise<string> 压缩文件路径
 */
export function zipDirectory(sourceDir, outPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver("zip", { zlib: { level: 9 } });
        output.on("close", () => resolve(outPath));
        archive.on("error", reject);
        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}
/**
 * 将zip文件解压到指定目录
 * @param zipPath 要解压的zip文件路径
 * @param destDir 解压目标目录
 * @param mode 解压模式: "overwrite" 表示覆盖目标目录, "merge" 表示合并到目标目录
 * @returns Promise<void>
 */
export async function unzipToDirectory(zipPath, destDir, mode) {
    // 规范化目标目录路径，使用path库函数
    const normalizedDestDir = path.normalize(destDir).replace(/[/\\]$/, "");
    // 创建目标目录路径
    const destDirBackup = `${normalizedDestDir}_bak`;
    // 如果目标目录存在，则重命名为 {destDir}_bak
    if (fs.existsSync(normalizedDestDir)) {
        // 如果备份目录已存在，先删除它
        if (fs.existsSync(destDirBackup)) {
            fs.rmSync(destDirBackup, { recursive: true, force: true });
        }
        // 重命名原目录为备份目录
        fs.renameSync(normalizedDestDir, destDirBackup);
    }
    // 确保目标目录存在
    fs.mkdirSync(normalizedDestDir, { recursive: true });
    // 根据模式决定是否需要还原备份目录的内容
    if (mode === "merge" && fs.existsSync(destDirBackup)) {
        // 在合并模式下，将备份目录的内容移回目标目录
        copyDirectoryContents(destDirBackup, normalizedDestDir);
    }
    // 解压文件
    const directory = await unzipper.Open.file(zipPath);
    await directory.extract({ path: normalizedDestDir });
}
/**
 * 复制目录内容（不包括目录本身）
 * @param src 源目录
 * @param dest 目标目录
 */
function copyDirectoryContents(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            // 如果目标位置已存在同名目录，先删除
            if (fs.existsSync(destPath)) {
                fs.rmSync(destPath, { recursive: true, force: true });
            }
            // 创建目录并递归复制内容
            fs.mkdirSync(destPath, { recursive: true });
            copyDirectoryContents(srcPath, destPath);
        }
        else {
            // 如果目标位置已存在同名文件，先删除
            if (fs.existsSync(destPath)) {
                fs.unlinkSync(destPath);
            }
            // 复制文件
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
/**
 * 准备目标目录，如果目标目录存在则重命名为备份目录，并创建新的目标目录
 * @param projectRootDir 项目根目录
 * @param targetDir 目标目录名
 * @returns {string} 目标目录的完整路径
 */
export function prepareTargetDirectory(projectRootDir, targetDir) {
    // 规范化目标目录路径，使用path库函数
    const normalizedTargetDir = path.normalize(targetDir).replace(/[/\\]$/, "");
    // 创建目标目录路径
    const destDir = path.join(projectRootDir, normalizedTargetDir);
    const destDirBackup = path.join(projectRootDir, `${normalizedTargetDir}_bak`);
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
//# sourceMappingURL=archive-utils.js.map