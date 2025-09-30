import fs from "fs";
import { Octokit } from "octokit";
import path from "path";
import { getEnvironmentVariables } from "./environment.js";
import { ensureTempDirectory } from "./path-validator.js";

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
export async function getOrCreateRelease(tagName?: string) {
    const { SHIPIT_GITHUB_OWNER, SHIPIT_GITHUB_REPO, SHIPIT_GITHUB_TAG } =
        getEnvironmentVariables();

    // 如果没有传入 tagName 参数，则使用环境变量中的标签，如果环境变量也不存在则使用默认值
    const tag = tagName || SHIPIT_GITHUB_TAG || "mcp-auto-upload";

    try {
        initOctokitInstance();
        const { data: release } = await octokit.rest.repos.getReleaseByTag({
            owner: SHIPIT_GITHUB_OWNER!,
            repo: SHIPIT_GITHUB_REPO!,
            tag: tag
        });
        return release;
    } catch (error) {
        if ((error as any).status === 404) {
            const { data: release } = await octokit.rest.repos.createRelease({
                owner: SHIPIT_GITHUB_OWNER!,
                repo: SHIPIT_GITHUB_REPO!,
                tag_name: tag,
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

/**
 * 从 GitHub Release 下载文件到项目的 tmp 目录中
 * @param projectRootDir 项目根目录
 * @param filename 要下载的文件名（如 xxx.zip）
 * @param targetDir 目标目录名（仅用于日志记录，实际文件下载到 tmp 目录）
 * @returns Promise<string> 下载文件的本地路径
 */
export async function downloadFromGithubRelease(
    projectRootDir: string,
    filename: string
): Promise<string> {
    initOctokitInstance();
    const { SHIPIT_GITHUB_OWNER, SHIPIT_GITHUB_REPO, SHIPIT_GITHUB_TAG } =
        getEnvironmentVariables();

    // 获取 Release 信息，使用环境变量中的标签名
    const release = await getOrCreateRelease(SHIPIT_GITHUB_TAG);

    // 查找要下载的资产
    const asset = release.assets.find((a) => a.name === filename);
    if (!asset) {
        throw new Error(`Asset ${filename} not found in release`);
    }

    // 创建目标目录路径（下载到 tmp 目录中）
    const tmpDir = ensureTempDirectory(projectRootDir);
    const filePath = path.join(tmpDir, filename);

    // 如果文件已存在，则删除它（覆盖）
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // 使用 Octokit 下载资产
    const response = await octokit.rest.repos.getReleaseAsset({
        owner: SHIPIT_GITHUB_OWNER!,
        repo: SHIPIT_GITHUB_REPO!,
        asset_id: asset.id,
        headers: {
            Accept: "application/octet-stream"
        }
    });

    // 将下载的内容写入文件
    // 注意：Octokit 返回的数据结构可能因 Accept 头而异
    const data = response.data as unknown as ArrayBuffer;
    fs.writeFileSync(filePath, Buffer.from(data));

    return filePath;
}
