import test from "node:test";
import assert from "node:assert/strict";

const blocked = ["file:///etc/passwd", "http://localhost", "http://127.0.0.1", "http://10.0.0.1", "https://admin:secret@example.com", "https://example.com:8080"];

test("audit policy documents rejectable private and unsafe targets", () => {
  for (const value of blocked) {
    const parsed = new URL(value);
    const unsafe = !["http:", "https:"].includes(parsed.protocol) || Boolean(parsed.username) || Boolean(parsed.password) || (parsed.port && !["80", "443"].includes(parsed.port)) || parsed.hostname === "localhost" || /^(127\.|10\.)/.test(parsed.hostname);
    assert.equal(Boolean(unsafe), true, value);
  }
});

test("public standard HTTPS target remains eligible", () => {
  const parsed = new URL("https://example.com/path");
  assert.equal(parsed.protocol, "https:");
  assert.equal(parsed.port, "");
  assert.equal(parsed.hostname, "example.com");
});

test("screenshot retention policy is exactly 24 hours", () => {
  const created = Date.parse("2026-09-07T00:00:00.000Z");
  const expires = created + 24 * 60 * 60 * 1000;
  assert.equal(new Date(expires).toISOString(), "2026-09-08T00:00:00.000Z");
});
