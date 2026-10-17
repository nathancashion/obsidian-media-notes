/* eslint-disable @typescript-eslint/no-var-requires */
/* global document */
jest.mock("obsidian", () => ({
	Plugin: class {
		constructor(app) { this.app = app; }
	},
	PluginSettingTab: class {
		constructor(app, plugin) {
			this.app = app;
			this.plugin = plugin;
			this.containerEl = document.createElement("div");
		}
	},
}), { virtual: true });
jest.mock("../viewPlugin", () => ({ createClickHandlerPlugin: jest.fn() }));
jest.mock("react-dom/client", () => ({
	createRoot: jest.fn(() => ({ render: jest.fn(), unmount: jest.fn() })),
}));

const YouTubeNotesPlugin = require("../main").default;
const { SettingsTab } = require("../settings");
const { EventEmitter } = require("../event-emitter");
const { readFileSync } = require("fs");
const path = require("path");

const createPlugin = async () => {
	const plugin = new YouTubeNotesPlugin({
		workspace: { getLeavesOfType: () => [] },
	});
	plugin.loadData = jest.fn().mockResolvedValue(null);
	plugin.saveData = jest.fn().mockResolvedValue(undefined);
	await plugin.loadSettings();
	return plugin;
};

const addPlayer = (plugin, id, timestamp = 12) => {
	const viewContainer = document.createElement("div");
	viewContainer.classList.add("media-container-parent-vertical");
	const container = document.createElement("div");
	container.className = "media-notes-container";
	viewContainer.append(container);
	document.body.append(viewContainer);
	const player = {
		ytRef: { current: { internalPlayer: { getCurrentTime: jest.fn().mockResolvedValue(timestamp) } } },
		mediaLink: `https://www.youtube.com/watch?v=${id}`,
		root: { unmount: jest.fn() },
		eventEmitter: new EventEmitter(),
		container,
		viewContainer,
	};
	plugin.players[id] = player;
	return player;
};

afterEach(() => { document.body.innerHTML = ""; });

test("all 11 preferences have searchable definitions and playback history is private", async () => {
	const plugin = await createPlugin();
	const tab = new SettingsTab(plugin.app, plugin);
	const definitions = tab.getSettingDefinitions();
	expect(definitions).toHaveLength(11);
	expect(definitions.map((item) => item.control.key).sort()).toEqual(
		Object.keys(plugin.settings).filter((key) => key !== "mediaData").sort()
	);
	definitions.forEach((item) => {
		expect(item.name).toBeTruthy();
		expect(item.desc).toBeTruthy();
	});
	expect(SettingsTab.prototype.display).toBeUndefined();
	expect(definitions.find((item) => item.control.key === "timestampTemplate").control.type).toBe("textarea");
	expect(definitions.find((item) => item.control.key === "seekSeconds").control).toMatchObject({
		min: 1, max: 60, step: 1,
	});
});

test("both color pickers remain visible when broad settings CSS hides native color inputs", async () => {
	const plugin = await createPlugin();
	const tab = new SettingsTab(plugin.app, plugin);
	expect(tab.containerEl.classList.contains("youtube-notes-settings")).toBe(true);
	const hiddenStyle = document.createElement("style");
	hiddenStyle.textContent = '.mod-settings .setting-item-control input[type="color"] { display: none; }';
	const pluginStyle = document.createElement("style");
	pluginStyle.textContent = readFileSync(path.resolve(__dirname, "../../styles.css"), "utf8");
	document.head.append(hiddenStyle, pluginStyle);
	const settings = document.createElement("div");
	settings.className = "mod-settings";
	settings.append(tab.containerEl);
	document.body.append(settings);
	const makeColorInput = (container) => {
		const control = document.createElement("div");
		control.className = "setting-item-control";
		const input = document.createElement("input");
		input.type = "color";
		control.append(input);
		container.append(control);
		return input;
	};
	try {
		const colorDefinitions = tab.getSettingDefinitions().filter(
			(item) => item.control.type === "color"
		);
		expect(colorDefinitions.map((item) => item.control.key)).toEqual([
			"backgroundColor", "progressBarColor",
		]);
		colorDefinitions.forEach(() => {
			const input = makeColorInput(tab.containerEl);
			expect(input.ownerDocument.defaultView.getComputedStyle(input).display).toBe("inline-block");
		});
		const otherTab = document.createElement("div");
		settings.append(otherTab);
		const unrelated = makeColorInput(otherTab);
		expect(unrelated.ownerDocument.defaultView.getComputedStyle(unrelated).display).toBe("none");
	} finally {
		hiddenStyle.remove();
		pluginStyle.remove();
	}
});

test("declarative edits persist through the live-update path without losing history", async () => {
	const plugin = await createPlugin();
	const oldSettings = plugin.settings;
	oldSettings.mediaData.video = { lastTimestampSeconds: 10 };
	const player = addPlayer(plugin, "video");
	const listener = jest.fn();
	player.eventEmitter.on("settingsUpdated", listener);
	const tab = new SettingsTab(plugin.app, plugin);
	await tab.setControlValue("displayProgressBar", false);
	expect(plugin.settings).not.toBe(oldSettings);
	expect(plugin.saveData).toHaveBeenCalledWith(expect.objectContaining({
		displayProgressBar: false, mediaData: oldSettings.mediaData,
	}));
	expect(listener).toHaveBeenCalledWith(expect.objectContaining({ displayProgressBar: false }));
	expect(listener.mock.calls[0][0]).not.toBe(plugin.settings);
	await tab.setControlValue("mediaData", {});
	expect(plugin.saveData).toHaveBeenCalledTimes(1);
});

test("settings saves serialize independent snapshots and broadcast without waiting for disk", async () => {
	const plugin = await createPlugin();
	const player = addPlayer(plugin, "video");
	const listener = jest.fn();
	player.eventEmitter.on("settingsUpdated", listener);
	let finishFirst;
	plugin.saveData.mockImplementationOnce(() => new Promise((resolve) => { finishFirst = resolve; }));
	plugin.settings.mediaData.video = { lastTimestampSeconds: 1 };
	const first = plugin.saveSettings();
	plugin.settings.seekSeconds = 25;
	plugin.settings.mediaData.video = { lastTimestampSeconds: 2 };
	const second = plugin.saveSettings();
	expect(listener).toHaveBeenCalledTimes(2);
	await Promise.resolve();
	expect(plugin.saveData).toHaveBeenCalledTimes(1);
	expect(plugin.saveData.mock.calls[0][0]).toMatchObject({
		seekSeconds: 10, mediaData: { video: { lastTimestampSeconds: 1 } },
	});
	finishFirst();
	await Promise.all([first, second]);
	expect(plugin.saveData.mock.calls[1][0]).toMatchObject({
		seekSeconds: 25, mediaData: { video: { lastTimestampSeconds: 2 } },
	});
});

test("declarative split, size and background controls update open player layouts", async () => {
	const plugin = await createPlugin();
	const player = addPlayer(plugin, "video");
	plugin.app.workspace.getLeavesOfType = () => [
		{ view: { containerEl: player.viewContainer } },
	];
	const tab = new SettingsTab(plugin.app, plugin);
	await tab.setControlValue("verticalPlayerHeight", 55);
	expect(player.container.style.height).toBe("55%");
	await tab.setControlValue("defaultSplitMode", "Vertical");
	await tab.setControlValue("horizontalPlayerWidth", 65);
	expect(player.container.style.width).toBe("65%");
	expect(player.viewContainer.classList.contains("media-container-parent-vertical")).toBe(true);
	await tab.setControlValue("backgroundColor", "#ffffff");
	expect(player.container.style.background).toBe("rgb(255, 255, 255)");
	await tab.setControlValue("defaultSplitMode", "Horizontal");
	expect(player.viewContainer.classList.contains("media-container-parent-vertical")).toBe(false);
	expect(player.container.style.width).toBe("100%");
});

test("a failed save does not block subsequent writes", async () => {
	const plugin = await createPlugin();
	plugin.saveData.mockRejectedValueOnce(new Error("disk unavailable"));
	await expect(plugin.saveSettings()).rejects.toThrow("disk unavailable");
	await expect(plugin.saveSettings()).resolves.toBeUndefined();
	expect(plugin.saveData).toHaveBeenCalledTimes(2);
});

test("playback saving accepts zero and never reloads stale settings", async () => {
	const plugin = await createPlugin();
	addPlayer(plugin, "video", 0);
	plugin.loadData.mockClear();
	await plugin.savePlayerTimestamp("video");
	expect(plugin.settings.mediaData.video.lastTimestampSeconds).toBe(0);
	expect(plugin.loadData).not.toHaveBeenCalled();
	expect(plugin.saveData).toHaveBeenCalledTimes(1);
});

test("unload unmounts every root, even without an active markdown view", async () => {
	const plugin = await createPlugin();
	const first = addPlayer(plugin, "first");
	const second = addPlayer(plugin, "second");
	first.root.unmount.mockImplementation(() => {
		expect(first.ytRef.current.internalPlayer.getCurrentTime).toHaveBeenCalled();
	});
	plugin.onunload();
	expect(first.root.unmount).toHaveBeenCalledTimes(1);
	expect(second.root.unmount).toHaveBeenCalledTimes(1);
	expect(first.container.isConnected).toBe(false);
	expect(first.viewContainer.classList.contains("media-container-parent-vertical")).toBe(false);
	expect(plugin.players).toEqual({});
	await Promise.resolve();
	await plugin.saveSettings();
	expect(plugin.settings.mediaData.first.lastTimestampSeconds).toBe(12);
	expect(plugin.settings.mediaData.second.lastTimestampSeconds).toBe(12);
});

test("default playback history is not shared between plugin instances", async () => {
	const first = await createPlugin();
	first.settings.mediaData.video = { lastTimestampSeconds: 12 };
	const second = await createPlugin();
	expect(second.settings.mediaData).toEqual({});
});

test("changing or removing media unmounts the old player and retains only the new root", async () => {
	const plugin = await createPlugin();
	let frontmatter = { media_link: "https://www.youtube.com/watch?v=first" };
	plugin.app.metadataCache = { getFileCache: () => ({ frontmatter }) };
	const containerEl = document.createElement("div");
	containerEl.innerHTML = '<div class="markdown-source-view"></div>';
	document.body.append(containerEl);
	const view = { containerEl, file: { path: "media.md" } };
	plugin.renderPlayerInView(view);
	const first = Object.values(plugin.players)[0];
	plugin.renderPlayerInView(view);
	expect(Object.values(plugin.players)).toEqual([first]);
	frontmatter = { media_link: "https://www.youtube.com/watch?v=second" };
	plugin.renderPlayerInView(view);
	expect(first.root.unmount).toHaveBeenCalledTimes(1);
	const second = Object.values(plugin.players)[0];
	expect(second.mediaLink).toContain("second");
	frontmatter = {};
	plugin.renderPlayerInView(view);
	expect(second.root.unmount).toHaveBeenCalledTimes(1);
	expect(plugin.players).toEqual({});
	expect(containerEl.querySelector(".media-notes-container")).toBeNull();
});

test("workspace changes clean up closed panes and metadata changes target the affected note", async () => {
	const plugin = await createPlugin();
	const handlers = {};
	const registerHandler = (event, handler) => { handlers[event] = handler; };
	plugin.app.workspace.on = registerHandler;
	plugin.app.workspace.getActiveViewOfType = () => null;
	plugin.app.metadataCache = { on: registerHandler };
	plugin.registerEvent = jest.fn();
	plugin.registerEditorExtension = jest.fn();
	plugin.addCommand = jest.fn();
	plugin.addSettingTab = jest.fn();
	await plugin.onload();
	const player = addPlayer(plugin, "closed");
	player.viewContainer.remove();
	handlers["layout-change"]();
	expect(player.root.unmount).toHaveBeenCalledTimes(1);
	expect(plugin.players).toEqual({});
	const file = { path: "changed.md" };
	const affected = { file };
	const other = { file: { path: "other.md" } };
	plugin.app.workspace.getLeavesOfType = () => [{ view: affected }, { view: other }];
	plugin.renderPlayerInView = jest.fn();
	handlers.changed(file);
	expect(plugin.renderPlayerInView).toHaveBeenCalledTimes(1);
	expect(plugin.renderPlayerInView).toHaveBeenCalledWith(affected);
	plugin.app.workspace.getLeavesOfType = () => [];
	await Promise.resolve();
	await plugin.saveSettings();
});
