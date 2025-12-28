import winston from "winston";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // error log
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: "error",
    }),

    // success + info log
    new winston.transports.File({
      filename: `${logDir}/combined.log`,
    }),
  ],
});

// development এ console এ দেখানোর জন্য
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;