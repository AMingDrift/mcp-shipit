/**
 * 将目录压缩为zip文件
 * @param sourceDir 要压缩的源目录
 * @param outPath 输出zip文件路径
 * @returns Promise<string> 压缩文件路径
 */
export declare function zipDirectory(sourceDir: string, outPath: string): Promise<string>;
