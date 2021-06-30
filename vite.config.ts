import { defineConfig } from "vite";
const fs = require("fs");

import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    open: true,
    https: {
      key: fs.readFileSync("ssl.key"),
      cert: fs.readFileSync("ssl.crt"),
    },
  },
});
