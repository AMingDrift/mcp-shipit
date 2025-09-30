import fs from "fs";
import path from "path";
import { unzipToDirectory } from "./archive-utils.js";
import { checkEnvironmentVariables } from "./environment.js";
import {
    downloadFromGithubRelease,
    getOrCreateRelease
} from "./github-release.js";
import { logMessage, setLoggingCallback } from "./log.js";

export { setLoggingCallback };

/**
 * 从GitHub Release下载文件并解压到目标目录
 * @param projectRootDir 项目根目录
 * @param targetDir 目标目录
 * @param filename 要下载的文件名（如 xxx.zip）
 * @param mode 解压模式: "overwrite" 表示覆盖目标目录, "merge" 表示合并到目标目录
 * @returns Promise<{ extractPath: string }> 解压后的目录路径
 */
export async function mcpUnshipit(
    projectRootDir: string,
    targetDir: string,
    filename: string,
    mode: "overwrite" | "merge" = "overwrite"
) {
    try {
        // 清理文件名，去除回车、换行、空格等无效字符
        const cleanFilename = filename.trim().replace(/[\r\n\t]/g, "");

        logMessage(
            `Starting mcpUnshipit process for target directory: ${targetDir}`,
            "info"
        );

        // 步骤1: 检查环境变量
        logMessage("Checking environment variables", "debug");
        checkEnvironmentVariables(projectRootDir);
        logMessage("Environment variables check passed", "debug");

        // 步骤2: 获取或创建GitHub Release
        logMessage("Getting or creating GitHub Release", "info");
        const release = await getOrCreateRelease();
        logMessage(`GitHub Release ready: ${release.id}`, "info");

        // 步骤3: 从GitHub Release下载文件到目标目录
        logMessage(`Downloading from GitHub Release: ${cleanFilename}`, "info");
        const downloadedFilePath = await downloadFromGithubRelease(
            projectRootDir,
            cleanFilename
        );
        logMessage(`Download completed to: ${downloadedFilePath}`, "info");

        // 步骤4: 解压下载的文件到目标目录
        // 规范化目标目录路径，使用path库函数
        const normalizedTargetDir = path
            .normalize(targetDir)
            .replace(/[/\\]$/, "");
        const destDir = path.join(projectRootDir, normalizedTargetDir);
        logMessage(
            `Extracting to directory: ${destDir} with mode: ${mode}`,
            "info"
        );
        await unzipToDirectory(downloadedFilePath, destDir, mode);
        logMessage(`Extraction completed to: ${destDir}`, "info");

        // 删除下载的zip文件
        logMessage(
            `Cleaning up temporary file: ${downloadedFilePath}`,
            "debug"
        );
        fs.unlinkSync(downloadedFilePath);
        logMessage("Temporary file cleaned up", "debug");

        // 步骤5: 返回解压路径
        return { extractPath: destDir };
    } catch (error: any) {
        logMessage(`mcpUnshipit process failed: ${error.message}`, "error");
        throw error;
    }
}
