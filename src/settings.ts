import { App, PluginSettingTab, SettingDefinitionItem } from "obsidian";
import type YouTubeNotesPlugin from "./main";
import type { YouTubeNotesPluginSettings } from "./main";

type SettingKey = Exclude<keyof YouTubeNotesPluginSettings, "mediaData">;

export class SettingsTab extends PluginSettingTab {
	plugin: YouTubeNotesPlugin;

	constructor(app: App, plugin: YouTubeNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.containerEl.classList.add("youtube-notes-settings");
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		const definition = this.getSettingDefinitions().find(
			(item) => "control" in item && item.control?.key === key
		);
		if (!definition) return;
		this.plugin.settings = { ...this.plugin.settings, [key]: value };
		await this.plugin.saveSettings();
	}

	getSettingDefinitions(): SettingDefinitionItem<SettingKey>[] {
		return [
			{
				name: "Default split view",
				desc: "Vertical or horizontal split view. Defaults to horizontal.",
				control: {
					type: "dropdown",
					key: "defaultSplitMode",
					options: { Vertical: "Vertical", Horizontal: "Horizontal" },
				},
			},
			{
				name: "Rewind & fast forward seconds",
				desc: "Number of seconds to rewind/fast forward.",
				control: { type: "slider", key: "seekSeconds", min: 1, max: 60, step: 1 },
			},
			{
				name: "Player height (%) in horizontal-split mode",
				desc: "The height of the player as a percentage of the viewport in horizontal-split mode.",
				control: { type: "slider", key: "verticalPlayerHeight", min: 5, max: 95, step: 5 },
			},
			{
				name: "Player width (%) in vertical-split mode",
				desc: "The width of the player as a percentage of the viewport in vertical-split mode.",
				control: { type: "slider", key: "horizontalPlayerWidth", min: 5, max: 95, step: 5 },
			},
			{
				name: "Timestamp offset seconds",
				desc: "Number of seconds in the past to offset by when inserting the timestamp.",
				control: { type: "slider", key: "timestampOffsetSeconds", min: 0, max: 60, step: 1 },
			},
			{
				name: "Timestamp template",
				desc: "Markdown template for inserted timestamps. Variables: {ts} is the timestamp, {link} is a timestamped URL, and \\n is a new line.",
				control: { type: "textarea", key: "timestampTemplate", rows: 3 },
			},
			{
				name: "Video player background",
				desc: "Background color for the video player.",
				control: { type: "color", key: "backgroundColor" },
			},
			{
				name: "Show progress bar",
				desc: "Display a progress bar for the elapsed time.",
				control: { type: "toggle", key: "displayProgressBar" },
			},
			{
				name: "Progress bar color",
				desc: "Color of the progress bar below the video.",
				control: { type: "color", key: "progressBarColor" },
			},
			{
				name: "Always display current timestamp",
				desc: "Always display the current timestamp. Otherwise, only show it when seeking.",
				control: { type: "toggle", key: "displayTimestamp" },
			},
			{
				name: "Pause media when inserting timestamp",
				desc: "If enabled, the media will pause when a timestamp is inserted.",
				control: { type: "toggle", key: "pauseOnTimestampInsert" },
			},
		];
	}
}
