/* global window, document */

function createMediaNote(browserWindow = window, pageDocument = document) {
	const url = new URL(browserWindow.location.href);
	const isYouTube = url.hostname === "youtube.com" ||
		url.hostname.endsWith(".youtube.com");
	const isShortLink = ["youtu.be", "www.youtu.be"].includes(url.hostname);
	if (!["https:", "http:"].includes(url.protocol) || (!isYouTube && !isShortLink)) {
		return;
	}

	const parts = url.pathname.split("/").filter(Boolean);
	const videoId = isShortLink
		? parts[0]
		: url.searchParams.get("v") ||
			(["shorts", "embed", "live"].includes(parts[0]) ? parts[1] : null);
	if (!videoId) return;

	const videoUrl = new URL("https://www.youtube.com/watch");
	videoUrl.searchParams.set("v", videoId);
	const video = pageDocument.querySelector("video");
	const timestamp = video?.currentTime;
	if (Number.isFinite(timestamp) && timestamp >= 0) {
		videoUrl.searchParams.set("t", String(Math.floor(timestamp)));
	} else if (/^\d+$/.test(url.searchParams.get("t") || "")) {
		videoUrl.searchParams.set("t", url.searchParams.get("t"));
	}
	if (video && !video.paused) video.pause();

	const title = makeObsidianFriendly(
		pageDocument.title.replace(/ - YouTube$/, "")
	);
	const content = "---\nmedia_link: " + JSON.stringify(videoUrl.toString()) +
		"\n---\n#Video #YouTube\n\n## Notes\n\n";
	browserWindow.open(
		"obsidian://new?name=" + encodeURIComponent(title + ".md") +
		"&content=" + encodeURIComponent(content)
	);
}

const makeObsidianFriendly = (title) => {
	const name = title.replace(/[:/\\^|#[\]*?"<>]/g, ".")
		.replace(/\s+/g, " ").trim().replace(/[. ]+$/, "");
	return "Video. " + (name || "YouTube video");
};

// --- exports ---
// don't change the above line, needed to strip exports from this file

module.exports = { makeObsidianFriendly, createMediaNote };
