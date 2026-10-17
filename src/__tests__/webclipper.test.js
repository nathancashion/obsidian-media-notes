/* eslint-disable @typescript-eslint/no-var-requires */
const template = require("../../YT-notes-webclipper.json");
const manifest = require("../../manifest.json");
const pkg = require("../../package.json");
const versions = require("../../versions.json");

test("Web Clipper retains the submitted template fields and media link binding", () => {
	expect(template).toMatchObject({
		schemaVersion: "0.1.0",
		name: "YouTube Notes",
		behavior: "create",
		noteNameFormat: "{{title}}",
		path: "YouTube",
	});
	expect(template.properties).toEqual([
		{ name: "media_link", value: "{{url}}", type: "text" },
		{ name: "title", value: "{{title}}", type: "text" },
		{ name: "source", value: "{{url}}", type: "text" },
		{ name: "published", value: "", type: "date" },
	]);
	expect(template.noteContentFormat).toBe("# {{title}}\n\n## Notes\n\n\n## Description\n\n\n{{content}}");
});

test("Web Clipper has the six unique host-prefix triggers submitted upstream", () => {
	expect(template.triggers).toEqual([
		"https://www.youtube.com/",
		"https://youtube.com/",
		"https://m.youtube.com/",
		"https://music.youtube.com/",
		"https://youtu.be/",
		"https://www.youtu.be/",
	]);
	expect(new Set(template.triggers).size).toBe(template.triggers.length);
	for (const trigger of template.triggers) {
		expect(new URL(trigger).protocol).toBe("https:");
	}
	expect(template.triggers.some((trigger) =>
		"https://www.youtube.com.example.org/watch?v=video".startsWith(trigger)
	)).toBe(false);
});

test("release metadata consistently uses the fork's new identity and minimum version", () => {
	expect(manifest).toMatchObject({
		id: "youtube-notes",
		name: "YouTube Notes",
		minAppVersion: "1.13.0",
	});
	expect(pkg.name).toBe("youtube-notes");
	expect(manifest.version).toBe(pkg.version);
	expect(versions[manifest.version]).toBe(manifest.minAppVersion);
});
