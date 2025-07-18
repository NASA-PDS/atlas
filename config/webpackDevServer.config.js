"use strict";

const fs = require("fs");
const errorOverlayMiddleware = require("react-dev-utils/errorOverlayMiddleware");
const evalSourceMapMiddleware = require("react-dev-utils/evalSourceMapMiddleware");
const noopServiceWorkerMiddleware = require("react-dev-utils/noopServiceWorkerMiddleware");
const ignoredFiles = require("react-dev-utils/ignoredFiles");
const paths = require("./paths");
const chalk = require("chalk");

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || "0.0.0.0";
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/sockjs-node'
const sockPort = process.env.WDS_SOCKET_PORT;

const port = parseInt(process.env.PORT || "8500", 10);

module.exports = function (proxy, allowedHost) {
    return {
        port: port,
        allowedHosts: !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === "true" ? "all" : "auto",
        static:{
          directory: paths.appPublic,
          publicPath: paths.publicUrl,
          watch: true
        },
        hot: true,
        webSocketServer: "ws",
        server: protocol,
        host,
    client: {
      // Silence WebpackDevServer's own logs since they're generally not useful.
      // It will still show compile warnings and errors with this setting.
      logging: "none",
      overlay: false,
      // Enable custom sockjs pathname for websocket connection to hot reloading server.
      // Enable custom sockjs hostname, pathname and port for websocket connection
      // to hot reloading server.
      webSocketURL: {
        hostname: sockHost,
        pathname: sockPath,
        port: sockPort,
      },
    },
        historyApiFallback: {
            // Paths with dots should still use the history fallback.
            // See https://github.com/facebook/create-react-app/issues/387.
            disableDotRule: true,
            index: paths.publicUrl,
        },
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
        // `proxy` is run between `before` and `after` `webpack-dev-server` hooks
        proxy,
    onListening(server) {
      console.log(chalk.cyan(`Atlas Dev server successfully started!\n`));
      console.log(
        chalk.hex("#00FF00")(
          `The main application can be accessed at\n    http://localhost:${
            port + 1
          }\n\nThe rest of the pages can be accessed at\n    http://localhost:${port}\n`
        )
      );

      console.log(chalk.cyan(`Compiling...\n`));
    },
  };
};
