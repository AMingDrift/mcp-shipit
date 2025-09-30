export declare function setLoggingCallback(callback: (message: string, level: "info" | "error" | "debug" | "warn") => void): void;
export declare function mcpShipit(projectRootDir: string, targetDir: string): Promise<{
    downloadUrl: string;
    zipFilename: string;
}>;
