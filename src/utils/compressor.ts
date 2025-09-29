import archiver from "archiver";
import fs from "fs";

/**
 * 将目录压缩为zip文件
 * @param sourceDir 要压缩的源目录
 * @param outPath 输出zip文件路径
 * @returns Promise<string> 压缩文件路径
 */
export function zipDirectory(sourceDir: string, outPath: string): Promise<string> {
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