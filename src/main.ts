import {Plugin} from 'obsidian';
import {debugLog} from "./util";
import {AIAdapterSettingsTab, loadSettings} from "./settings";
import {processQueue, setProvider} from "./globals";
import {initProvider} from "./provider";
import {query, queryWithImage} from './api';

export type AIAdapterAPI = {
	query: (promt: string) => Promise<string>;
	queryWithImage: (promt: string, image: string) => Promise<string>;
}

export default class AIAdapterPlugin extends Plugin {
	public api: AIAdapterAPI = {
		query: query,
		queryWithImage: queryWithImage,
	};

	async onload() {
		debugLog('loading ai adapter plugin');
		await loadSettings(this);

		setProvider(initProvider());

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AIAdapterSettingsTab(this.app, this));

		query("Hello, World!").then((response) => {
			debugLog(response);
			console.log(response);
		});
	}

	onunload() {
		processQueue.clear();
		debugLog('unloading ai adapter plugin');
	}
}


