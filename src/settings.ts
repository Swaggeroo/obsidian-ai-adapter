import {App, PluginSettingTab, Setting} from "obsidian";
import AIAdapterPlugin from "./main";
import {possibleModels, setProvider} from "./globals";
import {Models, providerNames, Providers} from "./types";
import {DEFAULT_OLLAMA_SETTINGS, OllamaProvider, OllamaSettings} from "./ollamaProvider";
import {initProvider} from "./provider";

interface AIAdapterPluginSettings {
	debug: boolean;
	provider: Providers;
	selectedModel: Models;
	selectedImageModel: Models;
	ollamaSettings: OllamaSettings;
}

const DEFAULT_SETTINGS: AIAdapterPluginSettings = {
	debug: false,
	provider: "ollama",
	selectedModel: possibleModels[0],
	selectedImageModel: possibleModels[0],
	ollamaSettings: DEFAULT_OLLAMA_SETTINGS
};

export let settings: AIAdapterPluginSettings = Object.assign({}, DEFAULT_SETTINGS);

export async function loadSettings(plugin: AIAdapterPlugin) {
	settings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
}

export async function saveSettings(plugin: AIAdapterPlugin) {
	await plugin.saveData(settings);
}

export class AIAdapterSettingsTab extends PluginSettingTab {
	plugin: AIAdapterPlugin;

	constructor(app: App, plugin: AIAdapterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Provider')
			.setDesc('Select the provider to use')
			.addDropdown(dropdown => dropdown
				.addOptions(providerNames.reduce((acc, provider) => {
					acc[provider] = provider;
					return acc;
				}, {} as Record<Providers, string>))
				.setValue(settings.provider)
				.onChange(async (value: Providers) => {
					settings.provider = value;
					setProvider(initProvider());
					await saveSettings(this.plugin);
				})
			);

		new Setting(containerEl)
			.setName('Model')
			.setDesc('Select the model to use')
			.addDropdown(dropdown => dropdown
				.addOptions(possibleModels
					.filter((model: Models) => model.provider == settings.provider && !model.imageReady)
					.reduce((acc, model) => {
						acc[model.name] = model.name;
						return acc;
					}, {} as Record<string, string>))
				.setValue(settings.selectedModel.name)
				.onChange(async (value) => {
					settings.selectedModel = possibleModels.find(model => model.name === value)!;
					await saveSettings(this.plugin);
				}));

		new Setting(containerEl)
			.setName('Image Model')
			.setDesc('Select the image model to use')
			.addDropdown(dropdown => dropdown
				.addOptions(possibleModels
					.filter((model: Models) => model.provider == settings.provider && model.imageReady)
					.reduce((acc, model) => {
						acc[model.name] = model.name;
						return acc;
					}, {} as Record<string, string>))
				.setValue(settings.selectedImageModel.name)
				.onChange(async (value) => {
					settings.selectedImageModel = possibleModels.find(model => model.name === value)!;
					await saveSettings(this.plugin);
				}));

		new Setting(containerEl)
			.setName('Debug mode')
			.setDesc('Enable debug mode to see logs in the console')
			.addToggle(toggle => toggle
				.setValue(settings.debug)
				.onChange(async (value) => {
					settings.debug = value;
					await saveSettings(this.plugin);
				}));

		OllamaProvider.generateSettings(containerEl, this.plugin);

	}
}
