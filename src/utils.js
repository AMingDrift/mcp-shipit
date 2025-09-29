import archiver from "archiver";
import fs from "fs";
import path from "path";
import { Octokit } from "octokit";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
// 获取当前文件目录的绝对路径

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mcpRootDir = path.resolve(__dirname, '../');
dotenv.config({ path: path.resolve(mcpRootDir, '.env'), quiet: true });
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function mcpShipit(projectRootDir, targetDir) {
    
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        throw new Error("Missing GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO in environment");
    }
    const resolvedPath = path.resolve(projectRootDir, targetDir);
    if (!resolvedPath.startsWith(projectRootDir)) {
        throw new Error("Invalid targetDir path");
    }
    
    // 添加目录存在检查
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Directory not found: ${targetDir}`)
    }

    const zipFilename = `upload-${Date.now()}.zip`;
    // 创建项目根目录下的tmp目录（如果不存在）
    const projectTmpDir = path.join(projectRootDir, 'tmp');
    if (!fs.existsSync(projectTmpDir)) {
        fs.mkdirSync(projectTmpDir, { recursive: true });
        // // console.error(`Created project temporary targetDir: ${projectTmpDir}`);
    }
    // 使用项目根目录下的tmp目录存储临时文件
    const tmpZipPath = path.join(projectTmpDir, zipFilename);

    try {
        // // console.error('Starting compression...');
        await zipDirectory(resolvedPath, tmpZipPath);
        // // console.error(`Compressed to ${tmpZipPath}`);

        // console.error('Getting or creating release...');
        const release = await getOrCreateRelease("mcp-auto-upload");
        // console.error(`Release obtained: ${release.id}`);

        // console.error('Uploading release asset...');
        const zipBuffer = fs.readFileSync(tmpZipPath);
        const uploadResult = await octokit.rest.repos.uploadReleaseAsset({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            release_id: release.id,
            name: zipFilename,
            data: zipBuffer,
            headers: {
                'content-type': 'application/zip',
                'content-length': zipBuffer.length.toString(),
            },
        });
        
        const downloadUrl = uploadResult.data.browser_download_url;
        return downloadUrl;
        } catch (error) {
        // console.error('Detailed error information:');
        // console.error('Error type:', typeof error);
        // console.error('Error message:', (error as any).message);
        // console.error('Error stack:', (error as any).stack);
        // console.error('Full error object:', error);
        throw error;
    } finally {
        if (fs.existsSync(tmpZipPath)) {
        // console.error(`Cleaning up temporary file: ${tmpZipPath}`);
        fs.unlinkSync(tmpZipPath);
        }
    }
}

function zipDirectory(sourceDir, outPath) {
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

// 修改 getOrCreateRelease 函数的错误处理
async function getOrCreateRelease(tagName = "auto-upload") {
  try {
    // console.error(`Attempting to get release by tag: ${tagName}`);
    const { data: release } = await octokit.rest.repos.getReleaseByTag({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      tag: tagName,
    });
    return release;
  } catch (error) {
    // console.error(`Error getting release: ${(error as any).message}`);
    if ((error).status === 404) {
      // console.error(`Release not found, creating new release with tag: ${tagName}`);
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
    // console.error('Unexpected error in getOrCreateRelease:', error);
    throw error;
  }
}