import { setLoggingCallback } from "./log.js";
export { setLoggingCallback };
export declare function mcpShipit(projectRootDir: string, targetDir: string): Promise<{
    downloadUrl: string;
    zipFilename: string;
}>;
