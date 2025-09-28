import AIAdapterPlugin from "../main";
import { Notice, Setting } from "obsidian";
import { Provider } from "../provider";
import { Models } from "../types";
import { notifyModelsChange, possibleModels } from "../globals";
import { saveSettings, settings } from "../settings";
import { GoogleGenAI } from "@google/genai";
import { debugLog } from "../util";

let gemini: GoogleGenAI;

export type GeminiSettings = {
	lastModel: Models;
	lastImageModel: Models;
	apiKey: string;
};

export const DEFAULT_GEMINI_SETTINGS: GeminiSettings = {
	lastModel: possibleModels[13],
	lastImageModel: possibleModels[12],
	apiKey: "",
};

export class GeminiProvider extends Provider {
	constructor() {
		super();
		this.lastModel = settings.geminiSettings.lastModel;
		this.lastImageModel = settings.geminiSettings.lastImageModel;
		GeminiProvider.restartSession();
		this.checkGemini();
	}

	generateSettings(containerEl: HTMLElement, plugin: AIAdapterPlugin) {
		new Setting(containerEl).setName("Gemini").setHeading();

		new Setting(containerEl)
			.setName("Gemini api key")
			.setDesc("Set the your gemini api token")
			.addText((text) =>
				text
					.setValue(
						settings.geminiSettings.apiKey !== ""
							? "••••••••••"
							: "",
					)
					.onChange(async (value) => {
						if (value.contains("•")) {
							return;
						}
						settings.geminiSettings.apiKey = value;
						GeminiProvider.restartSession();
						this.checkGemini();
						await saveSettings(plugin);
					}),
			);
	}

	async queryHandling(prompt: string): Promise<string> {
		const response = await gemini.models.generateContent({
			model: settings.selectedModel.model,
			contents: [
				{
					role: "user",
					parts: [{ text: prompt }],
				},
			],
		});

		if (response.text === undefined) {
			return "[AI-ERROR] No response from Gemini API";
		}

		return response.text;
	}

	async queryWithImageHandling(
		prompt: string,
		image: string,
	): Promise<string> {
		const response = await gemini.models.generateContent({
			model: settings.selectedImageModel.model,
			contents: [
				{
					role: "user",
					parts: [
						{ text: prompt },
						{ inlineData: { mimeType: "image/png", data: image } },
					],
				},
			],
		});

		if (response.text === undefined) {
			return "[AI-ERROR] No response from Gemini API";
		}

		return response.text;
	}

	setLastModel(model: Models) {
		super.setLastModel(model);
		settings.geminiSettings.lastModel = model;
	}

	setLastImageModel(model: Models) {
		super.setLastImageModel(model);
		settings.geminiSettings.lastImageModel = model;
	}

	static restartSession() {
		gemini = new GoogleGenAI({ apiKey: settings.geminiSettings.apiKey });
	}

	private async checkGemini() {
		try {
			let updated = false;

			for await (const model of await gemini.models.list()) {
				if (model.supportedActions?.includes("generateContent")) {
					const modelName = model.displayName ?? "unknown";
					const modelId = model.name ?? "unknown";

					const geminiModel: Models = {
						name: modelName,
						model: modelId,
						imageReady: true,
						provider: "gemini",
					};

					if (
						!possibleModels.some(
							(m) =>
								m.model === geminiModel.model && m.imageReady,
						)
					) {
						possibleModels.push(geminiModel);
						debugLog("Added model: " + geminiModel.name);
						updated = true;
					}

					const geminiTextModel: Models = {
						name: modelName,
						model: modelId,
						imageReady: false,
						provider: "gemini",
					};

					if (
						!possibleModels.some(
							(m) =>
								m.model === geminiModel.model && !m.imageReady,
						)
					) {
						possibleModels.push(geminiTextModel);
						debugLog("Added model: " + geminiTextModel.name);
						updated = true;
					}
				}
			}

			if (updated) {
				debugLog("Models updated, notifying settings tab");
				notifyModelsChange();
			}
		} catch (e) {
			debugLog(e);
			new Notice(
				"Error connecting to Gemini API. Please check your API key.",
			);
			new Notice(e.toString());
		}
	}
}
