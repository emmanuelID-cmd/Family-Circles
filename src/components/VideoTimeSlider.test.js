import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let vite;
let VideoTimeSlider;
let formatVideoTime;

before(async () => {
  vite = await createServer({
    configFile: false,
    appType: "custom",
    esbuild: { jsx: "automatic" },
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false },
  });
  ({ default: VideoTimeSlider, formatVideoTime } = await vite.ssrLoadModule("/src/components/VideoTimeSlider.jsx"));
});

after(async () => {
  await vite?.close();
});

const renderSlider = (props) => renderToStaticMarkup(React.createElement(VideoTimeSlider, { onSeek() {}, ...props }));

test("formats only valid media timestamps", () => {
  assert.equal(formatVideoTime(0), "0:00");
  assert.equal(formatVideoTime(61.7), "1:01");
  assert.equal(formatVideoTime(Number.NaN), "--:--");
  assert.equal(formatVideoTime(-1), "--:--");
});

test("shows selected and total duration with an accessible range", () => {
  const markup = renderSlider({ duration: 61.7, position: 15.25, label: "Video 9" });
  assert.match(markup, /aria-label="Selected video time"[^>]*>0:15/);
  assert.match(markup, /aria-label="Total video duration">1:02/);
  assert.match(markup, /type="range"/);
  assert.match(markup, /aria-label="Video 9 position"/);
  assert.match(markup, /aria-valuetext="0:15 of 1:02"/);
  assert.match(markup, /value="15.25"/);
});

test("does not present a false timeline for missing or invalid duration", () => {
  for (const duration of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    const markup = renderSlider({ duration, position: 5 });
    assert.doesNotMatch(markup, /type="range"/);
    assert.match(markup, /Timeline available when video loads/);
    assert.match(markup, /aria-label="Total video duration">--:--/);
  }
});

test("clamps displayed time and withholds the control when media is unavailable", () => {
  assert.match(renderSlider({ duration: 10, position: 99 }), /value="10"/);
  assert.match(renderSlider({ duration: 10, position: -5 }), /value="0"/);
  const unavailable = renderSlider({ duration: 10, position: 5, unavailable: true });
  assert.doesNotMatch(unavailable, /type="range"/);
  assert.match(unavailable, /Timeline unavailable/);
  assert.match(unavailable, /aria-label="Total video duration">--:--/);
});

test("range changes seek to the selected time and keep gestures in the slider", () => {
  const seeks = [];
  const scrubbing = [];
  const slider = VideoTimeSlider({ duration: 20, position: 2, onSeek: (time) => seeks.push(time), onScrubbingChange: (active) => scrubbing.push(active) });
  const range = slider.props.children[1];
  range.props.onChange({ currentTarget: { value: "7.5" } });
  range.props.onChange({ currentTarget: { value: "30" } });
  assert.deepEqual(seeks, [7.5, 20]);

  let stopped = 0;
  slider.props.onPointerDown({ stopPropagation() { stopped += 1; } });
  slider.props.onTouchStart({ stopPropagation() { stopped += 1; } });
  range.props.onKeyDown({ stopPropagation() { stopped += 1; } });
  assert.equal(stopped, 3);

  range.props.onPointerDown();
  range.props.onPointerUp();
  range.props.onTouchStart();
  range.props.onTouchEnd();
  range.props.onKeyDown({ key: "ArrowRight", stopPropagation() {} });
  range.props.onBlur();
  assert.deepEqual(scrubbing, [true, false, true, false, true, false]);
});
