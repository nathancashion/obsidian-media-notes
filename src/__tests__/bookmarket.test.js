/* eslint-disable @typescript-eslint/no-var-requires */
/* global document */
const { readFileSync } = require("fs");
const path = require("path");
const vm = require("vm");
const { makeObsidianFriendly, createMediaNote } = require("../bookmarklet");

const root = path.resolve(__dirname, "../..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");
const setup = (url, video = null, title = "A video - YouTube") => ({
	browser: { location: { href: url }, open: jest.fn() },
	page: { title, querySelector: jest.fn(() => video) },
});
const mediaUrl = (browser) => {
	const uri = new URL(browser.open.mock.calls[0][0]);
	const content = uri.searchParams.get("content");
	return {
		uri,
		content,
		link: new URL(JSON.parse(content.match(/^media_link: (.+)$/m)[1])),
	};
};

describe("Bookmarklet - makeObsidianFriendly", () => {
	test('should prepend "Video. " to the title and replace invalid characters with "."', () => {
		const title = "Example: A|Title/With\\Invalid^Characters#";
		const expected = "Video. Example. A.Title.With.Invalid.Characters";
		expect(makeObsidianFriendly(title)).toBe(expected);
	});

	test("should handle titles without invalid characters", () => {
		const title = "Valid Title";
		const expected = "Video. Valid Title";
		expect(makeObsidianFriendly(title)).toBe(expected);
	});

	test("handles brackets, question marks, whitespace and empty titles", () => {
		expect(makeObsidianFriendly('A [video]? * "title" <test>\nnext'))
			.toBe("Video. A .video.. . .title. .test. next");
		expect(makeObsidianFriendly("   ")).toBe("Video. YouTube video");
	});
});

test("captures playback position, pauses the browser video, and strips unrelated parameters", () => {
	const video = { currentTime: 123.9, paused: false, pause: jest.fn() };
	const { browser, page } = setup(
		"https://www.youtube.com/watch?v=video&t=5&list=playlist&si=tracking", video
	);
	createMediaNote(browser, page);
	const { uri, content, link } = mediaUrl(browser);
	expect(video.pause).toHaveBeenCalledTimes(1);
	expect(uri.protocol).toBe("obsidian:");
	expect(uri.hostname).toBe("new");
	expect(uri.searchParams.get("name")).toBe("Video. A video.md");
	expect(link.toString()).toBe("https://www.youtube.com/watch?v=video&t=123");
	expect(content).toContain("#Video #YouTube\n\n## Notes");
});

test("captures zero seconds without pausing an already-paused video", () => {
	const video = { currentTime: 0, paused: true, pause: jest.fn() };
	const { browser, page } = setup("https://www.youtube.com/watch?v=video&t=99", video);
	createMediaNote(browser, page);
	expect(mediaUrl(browser).link.searchParams.get("t")).toBe("0");
	expect(video.pause).not.toHaveBeenCalled();
});

test.each([
	"https://www.youtube.com/watch?v=video",
	"https://m.youtube.com/watch?v=video",
	"https://music.youtube.com/watch?v=video",
	"https://youtu.be/video",
	"https://www.youtu.be/video",
	"https://www.youtube.com/shorts/video",
	"https://www.youtube.com/embed/video",
	"https://www.youtube.com/live/video",
])("normalizes supported video pages without a video element: %s", (url) => {
	const { browser, page } = setup(url);
	createMediaNote(browser, page);
	expect(mediaUrl(browser).link.toString()).toBe("https://www.youtube.com/watch?v=video");
});

test("preserves an existing numeric timestamp when no video element is available", () => {
	const { browser, page } = setup("https://youtu.be/video?t=42&si=tracking");
	createMediaNote(browser, page);
	expect(mediaUrl(browser).link.searchParams.get("t")).toBe("42");
});

test.each([
	"https://notyoutube.com/watch?v=video",
	"https://youtube.com.example.org/watch?v=video",
	"https://example.org/?url=https://www.youtube.com/watch?v=video",
	"https://www.youtube.com/",
	"javascript:alert(1)",
])("does nothing on unsupported pages: %s", (url) => {
	const { browser, page } = setup(url);
	createMediaNote(browser, page);
	expect(browser.open).not.toHaveBeenCalled();
});

test("the copyable bookmarklet, README, and preview link are identical and executable", () => {
	const bookmarklet = read("bookmarklet.js").trim();
	expect(bookmarklet.startsWith("javascript:")).toBe(true);
	expect(bookmarklet.split("\n")).toHaveLength(1);
	expect(read("README.md")).toContain("```javascript\n" + bookmarklet + "\n```");
	const preview = document.createElement("div");
	preview.innerHTML = read("dist/index.html");
	expect(preview.querySelector("#bookmarklet").getAttribute("href")).toBe(bookmarklet);
	const { browser, page } = setup("https://www.youtube.com/watch?v=video");
	vm.runInNewContext(decodeURIComponent(bookmarklet.slice("javascript:".length)), {
		window: browser, document: page, URL,
	});
	expect(mediaUrl(browser).link.searchParams.get("v")).toBe("video");
});
