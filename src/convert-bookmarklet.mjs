import { readFileSync, writeFileSync } from "node:fs";
import { transformSync } from "esbuild";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const source = read("./bookmarklet.js").split("// --- exports ---")[0];
const { code } = transformSync(`(function () {${source}\ncreateMediaNote();}());`, {
	loader: "js",
	minify: true,
	target: "es2018",
});
const bookmarklet = `javascript:${encodeURIComponent(code.trim())}`;
const marker = /<!-- bookmarklet:start -->[\s\S]*?<!-- bookmarklet:end -->/;

const replaceBookmarklet = (path, content) => {
	const existing = read(path);
	if (!marker.test(existing)) throw new Error(`Missing bookmarklet markers in ${path}`);
	return existing.replace(marker, () =>
		`<!-- bookmarklet:start -->\n${content}\n<!-- bookmarklet:end -->`
	);
};

const outputs = new Map([
	["../bookmarklet.js", bookmarklet + "\n"],
	["../README.md", replaceBookmarklet("../README.md", "```javascript\n" + bookmarklet + "\n```")],
	["../dist/index.html", replaceBookmarklet("../dist/index.html",
		`<a id="bookmarklet" href="${bookmarklet}">YouTube Notes</a>`)],
]);

for (const [path, expected] of outputs) {
	if (process.argv.includes("--check")) {
		if (read(path) !== expected) {
			console.error(`${path} is out of date. Run npm run bookmarklet.`);
			process.exitCode = 1;
		}
	} else {
		writeFileSync(new URL(path, import.meta.url), expected);
	}
}
