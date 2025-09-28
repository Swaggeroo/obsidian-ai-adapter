import { Plugin } from "obsidian";
import { debugLog } from "./util";
import { AIAdapterSettingsTab, loadSettings } from "./settings";
import {
	processQueue,
	setProvider,
	unsubscribeFunctionSetting,
} from "./globals";
import { initProvider } from "./provider";
import { query, queryWithImage } from "./api";

export type AIAdapterAPI = {
	query: (prompt: string) => Promise<string>;
	queryWithImage: (prompt: string, image: string) => Promise<string>;
};

export default class AIAdapterPlugin extends Plugin {
	public api: AIAdapterAPI = {
		query: query,
		queryWithImage: queryWithImage,
	};

	async onload() {
		debugLog("loading ai adapter plugin");
		await loadSettings(this);

		setProvider(initProvider());

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AIAdapterSettingsTab(this.app, this));
	}

	onunload() {
		processQueue.clear();
		if (unsubscribeFunctionSetting) {
			unsubscribeFunctionSetting();
		}
		debugLog("unloading ai adapter plugin");
	}
}
