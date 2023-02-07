const log4js = require("log4js");

const levels = {
    trace: log4js.levels.TRACE,
    debug: log4js.levels.DEBUG,
    info: log4js.levels.INFO,
    warn: log4js.levels.WARN,
    error: log4js.levels.ERROR,
    fatal: log4js.levels.FATAL,
};

log4js.configure({
    //设置追加器
    appenders: {
        stdout: { 
            type: "stdout",
            layout: {
                type: "pattern",
                pattern: "%[[%d{yyyy-MM-dd hh:mm:ss}][%1-1p] %7-7c->%] %m",
              },
        },
        file: {
            type: "file",
            filename: "logs/mqtt_switch.log",
            keepFileExt: true,
            maxLogSize: 10485760,
            layout: {
                type: "pattern",
                pattern: "[%d{yyyy-MM-dd hh:mm:ss}][%1-1p] %7-7c-> %m",
              },
        },
    },
    categories: {
        default: {
            appenders: ["stdout", "file"],
            level: "all",
        },
    },
});

exports.getLogger = function (name, level) {
    var logger = log4js.getLogger(name);
    logger.level = levels[level];
    return logger;
};
