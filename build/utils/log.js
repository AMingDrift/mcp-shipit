let loggingCallback = null;
export function setLoggingCallback(callback) {
    loggingCallback = callback;
}
export function logMessage(message, level = "info") {
    if (loggingCallback) {
        try {
            loggingCallback(message, level);
        }
        catch (err) {
            // 静默处理日志回调错误，避免影响主流程
        }
    }
    else {
        // 仅在没有设置回调时输出到控制台，便于调试
        console.log(`[${level.toUpperCase()}] ${message}`);
    }
}
//# sourceMappingURL=log.js.map