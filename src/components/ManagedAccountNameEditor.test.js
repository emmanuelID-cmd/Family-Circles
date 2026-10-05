import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const previousUrl = process.env.VITE_SUPABASE_URL;
const previousKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
process.env.VITE_SUPABASE_URL = "https://example.supabase.co";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "test-only-publishable-key";

let server;
let ManagedAccountNameEditor;

before(async () => {
  server = await createServer({
    configFile: false,
    appType: "custom",
    esbuild: { jsx: "automatic" },
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false },
  });
  ({ default: ManagedAccountNameEditor } = await server.ssrLoadModule("/src/components/ManagedAccountNameEditor.jsx"));
});

after(async () => {
  await server?.close();
  if (previousUrl === undefined) delete process.env.VITE_SUPABASE_URL;
  else process.env.VITE_SUPABASE_URL = previousUrl;
  if (previousKey === undefined) delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  else process.env.VITE_SUPABASE_PUBLISHABLE_KEY = previousKey;
});

function renderEditor(profile) {
  return renderToStaticMarkup(React.createElement(ManagedAccountNameEditor, {
    accountId: "host-a", profile, onClose() {}, onSaved() {},
  }));
}

test("name editor labels both fields and shows only changed previous values", () => {
  const markup = renderEditor({
    username: "new.user", display_name: "Current Name", temp_user_name: "old.user",
    temp_screen_name: null, name_changed_at: new Date().toISOString(),
  });
  assert.match(markup, /Display name/);
  assert.match(markup, /Username/);
  assert.match(markup, /Previous username: <del>old\.user<\/del>/);
  assert.doesNotMatch(markup, /Previous display name:/);
  assert.match(markup, /one shared 30-day cooldown|A name change is active/);
});

test("active cooldown guidance gives an eligible date before another edit", () => {
  const markup = renderEditor({
    username: "new.user", display_name: "Current Name", temp_user_name: "old.user",
    temp_screen_name: "Old Name", name_changed_at: new Date().toISOString(),
  });
  assert.match(markup, /change either name again after/);
  assert.match(markup, /Previous display name: <del>Old Name<\/del>/);
});
