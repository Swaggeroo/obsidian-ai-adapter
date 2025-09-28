import { App, PluginSettingTab, Setting } from "obsidian";
import AIAdapterPlugin from "./main";
import { Models, providerNames, Providers } from "./types";
import {
	DEFAULT_OLLAMA_SETTINGS,
	OllamaSettings,
} from "./providers/ollamaProvider";
import {
	possibleModels,
	setProvider,
	subscribeModelsChange,
	setUnsubscribeFunctionSetting,
	provider,
} from "./globals";
import { debugLog, initProvider } from "./util";
// import {DEFAULT_EXAMPLE_SETTINGS, ExampleSettings} from "./exampleProvider"; [NEW PROVIDER]

interface AIAdapterPluginSettings {
	debug: boolean;
	provider: Providers;
	selectedModel: Models;
	selectedImageModel: Models;
	ollamaSettings: OllamaSettings;
	// exampleSettings: ExampleSettings; [NEW PROVIDER]
}

const DEFAULT_SETTINGS: AIAdapterPluginSettings = {
	debug: false,
	provider: "ollama",
	selectedModel: possibleModels[8],
	selectedImageModel: possibleModels[0],
	ollamaSettings: DEFAULT_OLLAMA_SETTINGS,
	// exampleSettings: DEFAULT_EXAMPLE_SETTINGS [NEW PROVIDER]
};

export let settings: AIAdapterPluginSettings = Object.assign(
	{},
	DEFAULT_SETTINGS,
);

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
		setUnsubscribeFunctionSetting(
			subscribeModelsChange(() => {
				debugLog("Models changed, updating settings tab");
				this.display();
			}),
		);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Provider")
			.setDesc("Select the provider to use")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(
						providerNames.reduce(
							(acc, provider) => {
								acc[provider] = provider;
								return acc;
							},
							{} as Record<Providers, string>,
						),
					)
					.setValue(settings.provider)
					.onChange(async (value: Providers) => {
						settings.provider = value;
						setProvider(initProvider());

						settings.selectedModel =
							provider.lastModel ?? possibleModels[0];

						settings.selectedImageModel =
							provider.lastImageModel ?? possibleModels[0];

						await saveSettings(this.plugin);
						this.display();
					}),
			);

		new Setting(containerEl)
			.setName("Model")
			.setDesc("Select the model to use")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(
						possibleModels
							.filter(
								(model: Models) =>
									model.provider == settings.provider &&
									!model.imageReady,
							)
							.reduce(
								(acc, model) => {
									acc[model.name] = model.name;
									return acc;
								},
								{} as Record<string, string>,
							),
					)
					.setValue(settings.selectedModel.name)
					.onChange(async (value) => {
						settings.selectedModel = possibleModels.find(
							(model) => model.name === value,
						)!;
						provider.setLastModel(settings.selectedModel);
						await saveSettings(this.plugin);
					}),
			);

		new Setting(containerEl)
			.setName("Image model")
			.setDesc("Select the image model to use")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(
						possibleModels
							.filter(
								(model: Models) =>
									model.provider == settings.provider &&
									model.imageReady,
							)
							.reduce(
								(acc, model) => {
									acc[model.name] = model.name;
									return acc;
								},
								{} as Record<string, string>,
							),
					)
					.setValue(settings.selectedImageModel.name)
					.onChange(async (value) => {
						settings.selectedImageModel = possibleModels.find(
							(model) => model.name === value,
						)!;
						provider.setLastImageModel(settings.selectedImageModel);
						await saveSettings(this.plugin);
					}),
			);

		new Setting(containerEl)
			.setName("Debug mode")
			.setDesc("Enable debug mode to see logs in the console")
			.addToggle((toggle) =>
				toggle.setValue(settings.debug).onChange(async (value) => {
					settings.debug = value;
					await saveSettings(this.plugin);
				}),
			);

		provider.generateSettings(containerEl, this.plugin);
	}
}
