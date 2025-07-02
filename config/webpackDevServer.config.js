"use strict";

const fs = require("fs");
const errorOverlayMiddleware = require("react-dev-utils/errorOverlayMiddleware");
const evalSourceMapMiddleware = require("react-dev-utils/evalSourceMapMiddleware");
const noopServiceWorkerMiddleware = require("react-dev-utils/noopServiceWorkerMiddleware");
const ignoredFiles = require("react-dev-utils/ignoredFiles");
const paths = require("./paths");

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || "0.0.0.0";

module.exports = function (proxy, allowedHost) {
    return {
        allowedHosts: !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === "true" ? "all" : "auto",
        static:{
          watch: true
        },
        hot: true,
        webSocketServer: "ws",
        server: protocol,
        host,
        historyApiFallback: {
            // Paths with dots should still use the history fallback.
            // See https://github.com/facebook/create-react-app/issues/387.
            disableDotRule: true,
        },
        proxy,
        setupMiddlewares(middlewares, devServer) {
          if (!devServer) {
            throw new Error("webpack-dev-server is not defined");
          }

          if (fs.existsSync(paths.proxySetup)) {
            require(paths.proxySetup)(devServer.app);
          }
          middlewares.push(
            evalSourceMapMiddleware(devServer),
            errorOverlayMiddleware(),
            noopServiceWorkerMiddleware('/')
          );

          return middlewares;
        },
    }
}
