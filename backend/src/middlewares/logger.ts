import { createLogger, format, transports } from "winston";
import { Request, Response, NextFunction } from "express";
const { combine, timestamp, prettyPrint } = format;

const logger = createLogger({
  level: "info",
  format: combine(timestamp(), prettyPrint()),
  transports: [new transports.Console()],
});

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
};

export default loggerMiddleware;
