import { Octokit } from "octokit";
import fs from "fs";
import { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } from "./environment.js";
// 初始化 Octokit 客户端
const octokit = new Octokit({ auth: GITHUB_TOKEN });
/**
 * 获取或创建 GitHub Release
 * @param tagName 标签名称
 * @returns Promise<Release> GitHub Release 对象
 */
export async function getOrCreateRelease(tagName = "mcp-auto-upload") {
    try {
        const { data: release } = await octokit.rest.repos.getReleaseByTag({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            tag: tagName,
        });
        return release;
    }
    catch (error) {
        if (error.status === 404) {
            const { data: release } = await octokit.rest.repos.createRelease({
                owner: GITHUB_OWNER,
                repo: GITHUB_REPO,
                tag_name: tagName,
                name: "Auto-generated Uploads",
                body: "Managed by MCP tool",
                draft: false,
                prerelease: false,
            });
            return release;
        }
        throw error;
    }
}
/**
 * 上传文件到 GitHub Release
 * @param releaseId Release ID
 * @param filePath 要上传的文件路径
 * @param filename 上传后的文件名
 * @returns Promise<string> 文件下载URL
 */
export async function uploadToRelease(releaseId, filePath, filename) {
    const zipBuffer = fs.readFileSync(filePath);
    const uploadResult = await octokit.rest.repos.uploadReleaseAsset({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        release_id: releaseId,
        name: filename,
        data: zipBuffer,
        headers: {
            'content-type': 'application/zip',
            'content-length': zipBuffer.length.toString(),
        },
    });
    return uploadResult.data.browser_download_url;
}
//# sourceMappingURL=github-release.js.map