import { createLogger, format, transports } from "winston";
import { Request, Response, NextFunction } from "express";
import client from "prom-client";

const { combine, timestamp, prettyPrint } = format;

const logger = createLogger({
  level: "info",
  format: combine(timestamp(), prettyPrint()),
  transports: [new transports.Console()],
});

const requestDuration = new client.Histogram({
  name: "request_duration",
  help: "Duration of HTTP requests in milliseconds",
  labelNames: ["method", "route", "statusCode"],
  buckets: [0.1, 0.5, 1, 2.5, 5, 10, 50, 100, 200, 500, 1000, 2000, 5000],
});

const activeRequestsGauge = new client.Gauge({
  name: "active_requests",
  help: "Gauge of active HTTP requests",
});

const requestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "statusCode"],
});

const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`
    );

    if (req.originalUrl !== "/metrics") {
      activeRequestsGauge.inc();

      // Get the base path without query parameters
      const basePath = req.originalUrl.split("?")[0];

      // For specific routes, only use the first path segment
      const firstSegment = basePath.split("/")[1];
      const route = ["discussions", "groups", "files"].includes(firstSegment)
        ? `/${firstSegment}`
        : basePath;

      requestDuration.observe(
        {
          method: req.method,
          route,
          statusCode: res.statusCode,
        },
        responseTime
      );
      requestCounter.inc({
        method: req.method,
        route,
        statusCode: res.statusCode,
      });

      activeRequestsGauge.dec();
    }
  });
  next();
};

export default metricsMiddleware;
