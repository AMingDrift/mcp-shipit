import fs from "fs";
import { Octokit } from "octokit";
import { getEnvironmentVariables } from "./environment.js";

let octokit: Octokit;
function initOctokitInstance() {
    if (!octokit) {
        const { SHIPIT_GITHUB_TOKEN } = getEnvironmentVariables();

        // 初始化 Octokit 客户端
        octokit = new Octokit({ auth: SHIPIT_GITHUB_TOKEN });
    }
}
/**
 * 获取或创建 GitHub Release
 * @param tagName 标签名称
 * @returns Promise<Release> GitHub Release 对象
 */
export async function getOrCreateRelease(tagName = "mcp-auto-upload") {
    const { SHIPIT_GITHUB_OWNER, SHIPIT_GITHUB_REPO } =
        getEnvironmentVariables();
    try {
        initOctokitInstance();
        const { data: release } = await octokit.rest.repos.getReleaseByTag({
            owner: SHIPIT_GITHUB_OWNER!,
            repo: SHIPIT_GITHUB_REPO!,
            tag: tagName
        });
        return release;
    } catch (error) {
        if ((error as any).status === 404) {
            const { data: release } = await octokit.rest.repos.createRelease({
                owner: SHIPIT_GITHUB_OWNER!,
                repo: SHIPIT_GITHUB_REPO!,
                tag_name: tagName,
                name: "Auto-generated Uploads",
                body: "Managed by MCP tool",
                draft: false,
                prerelease: false
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
export async function uploadToRelease(
    releaseId: number,
    filePath: string,
    filename: string
): Promise<string> {
    initOctokitInstance();
    const { SHIPIT_GITHUB_OWNER, SHIPIT_GITHUB_REPO } =
        getEnvironmentVariables();
    const zipBuffer = fs.readFileSync(filePath);
    const uploadResult = await octokit.rest.repos.uploadReleaseAsset({
        owner: SHIPIT_GITHUB_OWNER!,
        repo: SHIPIT_GITHUB_REPO!,
        release_id: releaseId,
        name: filename,
        data: zipBuffer as unknown as string,
        headers: {
            "content-type": "application/zip",
            "content-length": zipBuffer.length.toString()
        }
    });

    return uploadResult.data.browser_download_url;
}
