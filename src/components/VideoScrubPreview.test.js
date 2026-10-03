import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let VideoScrubPreview;

before(async () => {
  server = await createServer({
    configFile: false,
    appType: "custom",
    esbuild: { jsx: "automatic" },
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false },
  });
  ({ default: VideoScrubPreview } = await server.ssrLoadModule("/src/components/VideoScrubPreview.jsx"));
});

after(async () => { await server?.close(); });

test("preview and slider use the same rounded-up total duration", () => {
  const markup = renderToStaticMarkup(React.createElement(VideoScrubPreview, {
    src: "/assets/reel-01.mp4", time: 7.5, duration: 14.067, active: true,
  }));
  assert.match(markup, /Video scrub preview/);
  assert.match(markup, /0:07 \/ 0:15/);
});

test("preview with invalid timing announces a fallback without fetching media", () => {
  const markup = renderToStaticMarkup(React.createElement(VideoScrubPreview, {
    src: "/assets/reel-01.mp4", time: 3, duration: 0, active: true,
  }));
  assert.match(markup, /Preview unavailable until video timing loads/);
  assert.doesNotMatch(markup, /<video/);
});
