"use strict";

import fs from "fs";
import { createRequire } from "module";
import express from "express";
import { noopServiceWorkerMiddleware } from "./build-utils.js";
import paths from "./paths.js";
import chalk from "chalk";

// `paths.proxySetup` is a runtime-computed, optional project file (may not
// exist), so it needs a real `require()` rather than a static import.
const require = createRequire(import.meta.url);

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || "0.0.0.0";
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/sockjs-node'
const sockPort = process.env.WDS_SOCKET_PORT;

const port = parseInt(process.env.PORT || "8500", 10);

export default function (proxy, allowedHost) {
    return {
        port: port,
        allowedHosts: !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === "true" ? "all" : "auto",
        static:{
          directory: paths.appPublic,
          publicPath: '/',  // Always serve static files from root in dev mode
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
            index: '/',  // Always use root index in dev mode
        },
        setupMiddlewares(middlewares, devServer) {
          if (!devServer) {
            throw new Error("webpack-dev-server is not defined");
          }

          if (fs.existsSync(paths.proxySetup)) {
            require(paths.proxySetup)(devServer.app);
          }

          // Serve Docusaurus documentation in dev mode
          const docPath = paths.docBuild;
          if (fs.existsSync(docPath)) {
            devServer.app.use('/documentation', express.static(docPath));
            console.log(chalk.cyan('Documentation available at http://localhost:' + port + '/documentation'));
          } else {
            console.log(chalk.yellow('Documentation not built. Run "npm run build-docs" to build it.'));
          }

          middlewares.push(
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
