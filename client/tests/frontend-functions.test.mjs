import test from "node:test";
import assert from "node:assert/strict";
import { streamEmbedUrl } from "../src/functions/stream.js";
import { certificateSvg } from "../src/functions/certificates.js";
test("YouTube watch link becomes a privacy-enhanced embeddable URL", () => {
  assert.equal(
    streamEmbedUrl("https://www.youtube.com/watch?v=ABCDEFGHIJK"),
    "https://www.youtube-nocookie.com/embed/ABCDEFGHIJK",
  );
  assert.equal(
    streamEmbedUrl("https://youtu.be/ABCDEFGHIJK"),
    "https://www.youtube-nocookie.com/embed/ABCDEFGHIJK",
  );
});
test("Invalid stream protocols and unsupported hosts cannot be embedded", () => {
  assert.equal(streamEmbedUrl("javascript:alert(1)"), "");
  assert.equal(streamEmbedUrl("https://evil.example/?v=ABCDEFGHIJK"), "");
  assert.equal(streamEmbedUrl("https://www.youtube.com/watch?v=oops"), "");
});
test("Certificate text is escaped to avoid markup injection", () => {
  const svg = certificateSvg(
    { name: "Mika <Admin> & Friends" },
    { title: "Spring & Summer <Final>" },
    "2026-11-04T12:00:00",
  );
  assert.ok(svg.includes("Mika &lt;Admin&gt; &amp; Friends"));
  assert.ok(svg.includes("Spring &amp; Summer &lt;Final&gt;"));
  assert.ok(!svg.includes("<Admin>"));
});
