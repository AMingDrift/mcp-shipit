import fs from "fs";
import { customAlphabet } from "nanoid";
import path from "path";
import { zipDirectory } from "./archive-utils.js";
import { checkEnvironmentVariables } from "./environment.js";
import { getOrCreateRelease, uploadToRelease } from "./github-release.js";
import { logMessage, setLoggingCallback } from "./log.js";
import { ensureTempDirectory, validateTargetPath } from "./path-validator.js";

export { setLoggingCallback };

export async function mcpShipit(projectRootDir: string, targetDir: string) {
    try {
        logMessage(
            `Starting mcpShipit process for target directory: ${targetDir}`,
            "info"
        );

        // 步骤1: 检查环境变量
        logMessage("Checking environment variables", "debug");
        checkEnvironmentVariables(projectRootDir);
        logMessage("Environment variables check passed", "debug");

        // 步骤2: 验证目标路径
        logMessage(`Validating target path: ${targetDir}`, "debug");
        const resolvedPath = validateTargetPath(projectRootDir, targetDir);
        logMessage("Target path validation passed", "debug");

        // 步骤3: 生成文件名和路径
        const nanoid = customAlphabet("1234567890abcdef", 5);
        const projectRootBaseName = path.basename(projectRootDir);
        const normalizedTargetDir = targetDir.replace(/[/\\]/g, "_");
        const dateTime = new Date()
            .toLocaleDateString("zh-CN", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit"
            })
            .replace(/\//g, "");
        const zipFilename = `mcp-upload-${projectRootBaseName}_${normalizedTargetDir}-${dateTime}-${nanoid()}.zip`;
        logMessage(`Generated zip filename: ${zipFilename}`, "debug");
        const projectTmpDir = ensureTempDirectory(projectRootDir);
        const tmpZipPath = path.join(projectTmpDir, zipFilename);
        logMessage(`Temporary zip path: ${tmpZipPath}`, "debug");

        try {
            // 步骤4: 压缩目录
            logMessage(`Compressing directory: ${targetDir}`, "info");
            await zipDirectory(resolvedPath, tmpZipPath);
            logMessage(`Directory compression completed: ${targetDir}`, "info");

            // 步骤5: 获取或创建GitHub Release
            logMessage("Getting or creating GitHub Release", "info");
            const release = await getOrCreateRelease();
            logMessage(`GitHub Release ready: ${release.id}`, "info");

            // 步骤6: 上传到GitHub Release
            logMessage(`Uploading to GitHub Release: ${zipFilename}`, "info");
            const downloadUrl = await uploadToRelease(
                release.id,
                tmpZipPath,
                zipFilename
            );
            logMessage(
                `Upload completed. Download URL: ${downloadUrl}`,
                "info"
            );

            // 步骤7: 返回下载URL
            return { downloadUrl, zipFilename };
        } catch (error: any) {
            logMessage(`Error during operation: ${error.message}`, "error");
            throw error;
        } finally {
            // 步骤8: 清理临时文件
            logMessage(`Cleaning up temporary file: ${tmpZipPath}`, "debug");
            if (fs.existsSync(tmpZipPath)) {
                fs.unlinkSync(tmpZipPath);
                logMessage("Temporary file cleaned up", "debug");
            }
        }
    } catch (error: any) {
        logMessage(`mcpShipit process failed: ${error.message}`, "error");
        throw error;
    }
}
