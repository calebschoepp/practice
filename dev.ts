#!/usr/bin/env bun
import { serve } from "bun";
import index from "./src/index.html";

const server = serve({
  routes: {
    "/*": index,
  },

  development: {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Dev server running at ${server.url}`);
