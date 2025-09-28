import { Provider } from "./provider";
import { Notice, Setting } from "obsidian";
import { saveSettings, settings } from "./settings";
import AIAdapterPlugin from "./main";
import { debugLog } from "./util";
import { ChatResponse, Ollama } from "ollama";
import { Models } from "./types";
import { notifyModelsChange, possibleModels } from "./globals";

let ollama: Ollama;

export type OllamaSettings = {
	url: string;
	token: string;
};

export const DEFAULT_OLLAMA_SETTINGS: OllamaSettings = {
	url: "http://127.0.0.1:11434",
	token: "",
};

export class OllamaProvider extends Provider {
	constructor() {
		super();
		OllamaProvider.refreshInstance();
		this.checkOllama();
	}

	static generateSettings(containerEl: HTMLElement, plugin: AIAdapterPlugin) {
		new Setting(containerEl).setName("Ollama").setHeading();

		new Setting(containerEl)
			.setName("Pull models")
			.setDesc("Pull the selected models")
			.addButton((button) =>
				button.setButtonText("Pull model").onClick(async () => {
					await OllamaProvider.pullImage(settings.selectedModel);
					await OllamaProvider.pullImage(settings.selectedImageModel);
				}),
			);

		new Setting(containerEl)
			.setName("Ollama URL")
			.setDesc("Set the URL for the Ollama server")
			.addText((text) =>
				text
					.setPlaceholder("Enter the host (http://127.0.0.1:11434)")
					.setValue(settings.ollamaSettings.url)
					.onChange(async (value) => {
						if (value.length === 0) {
							value = DEFAULT_OLLAMA_SETTINGS.url;
						}
						settings.ollamaSettings.url = value;
						OllamaProvider.refreshInstance();
						await saveSettings(plugin);
					}),
			);

		new Setting(containerEl)
			.setName("Ollama token (optional)")
			.setDesc("Set the token for authentication with the Ollama server")
			.addText((text) =>
				text
					.setValue(
						settings.ollamaSettings.token !== ""
							? "••••••••••"
							: "",
					)
					.onChange(async (value) => {
						if (value.contains("•")) {
							return;
						}
						settings.ollamaSettings.token = value;
						OllamaProvider.refreshInstance();
						await saveSettings(plugin);
					}),
			);
	}

	async queryHandling(prompt: string): Promise<string> {
		const response: ChatResponse = await ollama.chat({
			model: settings.selectedModel.model, //llava:13b or llava or llava-llama3
			messages: [{ role: "user", content: prompt }],
		});
		return response.message.content;
	}

	async queryWithImageHandling(
		prompt: string,
		image: string,
	): Promise<string> {
		const response: ChatResponse = await ollama.chat({
			model: settings.selectedModel.model, //llava:13b or llava or llava-llama3
			messages: [{ role: "user", content: prompt, images: [image] }],
		});
		return response.message.content;
	}

	private async checkOllama() {
		try {
			const models = await ollama.list();
			debugLog(models);
			let updated = false;
			for (const model of models.models) {
				const capabilities = (await ollama.show({ model: model.name }))
					.capabilities;
				const isImageModel = capabilities.includes("vision");
				const isTextModel = capabilities.includes("completion");
				const name =
					model.name.split(":")[0] +
					" [" +
					model.details.parameter_size +
					"]" +
					" (custom)";

				if (
					isTextModel &&
					!possibleModels.some(
						(m) => m.model === model.name && !m.imageReady,
					)
				) {
					possibleModels.push({
						name,
						model: model.name,
						provider: "ollama",
						imageReady: false,
					});
					debugLog("Added model: " + name);
					updated = true;
				}

				if (
					isImageModel &&
					!possibleModels.some(
						(m) => m.model === model.name && m.imageReady,
					)
				) {
					possibleModels.push({
						name,
						model: model.name,
						provider: "ollama",
						imageReady: true,
					});
					debugLog("Added image model: " + name);
					updated = true;
				}
			}

			if (updated) {
				debugLog("Models updated, notifying settings tab");
				notifyModelsChange();
			}

			if (
				!models.models.some(
					(model) => model.name === settings.selectedModel.model,
				)
			) {
				new Notice(
					`No ${settings.selectedModel.name} model found, please make sure you have pulled it (you can pull it over the settings tab or choose another model)`,
				);
			}
			if (
				!models.models.some(
					(model) => model.name === settings.selectedImageModel.model,
				)
			) {
				new Notice(
					`No ${settings.selectedImageModel.name} model found, please make sure you have pulled it (you can pull it over the settings tab or choose another model)`,
				);
			}
		} catch (e) {
			debugLog(e);
			new Notice("Failed to connect to Ollama.");
			new Notice(e.toString());
		}
	}

	static async pullImage(model: Models) {
		let progressNotice: Notice | undefined;
		try {
			new Notice(
				`Pulling ${model.name} model started, this may take a while...`,
			);
			const response = await ollama.pull({
				model: model.model,
				stream: true,
			});
			progressNotice = new Notice(`Pulling ${model.name} model 0%`, 0);
			for await (const part of response) {
				debugLog(part);
				if (part.total !== null && part.completed !== null) {
					const percentage = (part.completed / part.total) * 100;
					if (
						!isNaN(percentage) &&
						percentage !== Infinity &&
						percentage !== -Infinity
					) {
						const roundedNumber = percentage.toFixed(2);
						const completed = (part.completed / 1000000000).toFixed(
							2,
						);
						const total = (part.total / 1000000000).toFixed(2);
						progressNotice.setMessage(
							`Pulling ${model.name} model ${roundedNumber}% (${completed}GB/${total}GB)`,
						);
					}
				}
			}
			progressNotice.hide();
			new Notice(`${model.name} model pulled successfully`);
		} catch (e) {
			debugLog(e);
			progressNotice?.hide();
			new Notice(`Failed to pull ${model.name} model`);
			new Notice(e.toString());
		}
	}

	static refreshInstance() {
		ollama = new Ollama({
			host: settings.ollamaSettings.url,
			headers: {
				Authorization: `Bearer ${settings.ollamaSettings.token}`,
			},
		});
	}
}
