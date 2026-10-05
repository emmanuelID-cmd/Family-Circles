import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { VIDEO_SPEED_OPTIONS } from "../lib/videoSpeed.js";

let vite;
let VideoSpeedSelect;

before(async () => {
  vite = await createServer({
    configFile: false,
    appType: "custom",
    esbuild: { jsx: "automatic" },
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false },
  });
  ({ default: VideoSpeedSelect } = await vite.ssrLoadModule("/src/components/VideoSpeedSelect.jsx"));
});

after(async () => {
  await vite?.close();
});

test("renders every approved speed with a visible active value and native label", () => {
  const markup = renderToStaticMarkup(React.createElement(VideoSpeedSelect, { speed: 1.75, onChange() {} }));
  assert.match(markup, /Playback speed<select/);
  assert.match(markup, /aria-label="Active playback speed">1\.75×<\/output>/);
  assert.equal((markup.match(/<option /g) ?? []).length, VIDEO_SPEED_OPTIONS.length);
  for (const option of VIDEO_SPEED_OPTIONS) {
    assert.match(markup, new RegExp(`value="${option}"`));
    assert.match(markup, new RegExp(`${option.toFixed(2)}×`));
  }
  assert.match(markup, /<option value="1\.75" selected="">1\.75×<\/option>/);
});

test("defaults invalid or missing speed to 1.00× without writing preference", () => {
  for (const speed of [undefined, 999, "2"]) {
    const markup = renderToStaticMarkup(React.createElement(VideoSpeedSelect, { speed }));
    assert.match(markup, /<option value="1" selected="">1\.00×<\/option>/);
    assert.match(markup, /aria-label="Active playback speed">1\.00×<\/output>/);
  }
});

test("change reports only an approved speed; it does not control playback", () => {
  const changed = [];
  const control = VideoSpeedSelect({ speed: 1, onChange: (speed) => changed.push(speed) });
  const select = control.props.children[0].props.children[1];
  select.props.onChange({ currentTarget: { value: "2" } });
  select.props.onChange({ currentTarget: { value: "2.5" } });
  assert.deepEqual(changed, [2]);
  assert.equal(select.props.value, 1);
});

test("disabled selection is inert and interaction does not bubble to video controls", () => {
  const changed = [];
  const control = VideoSpeedSelect({ speed: 3, disabled: true, onChange: (speed) => changed.push(speed) });
  const select = control.props.children[0].props.children[1];
  assert.equal(select.props.disabled, true);
  select.props.onChange({ currentTarget: { value: "1.5" } });
  assert.deepEqual(changed, []);

  let stopped = 0;
  const event = { stopPropagation() { stopped += 1; } };
  control.props.onClick(event);
  control.props.onPointerDown(event);
  control.props.onTouchStart(event);
  assert.equal(stopped, 3);
});
