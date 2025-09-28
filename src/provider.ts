import AIAdapterPlugin from "./main";
import { Models } from "./types";

export abstract class Provider {
	lastModel: Models;
	lastImageModel: Models;

	abstract queryHandling(prompt: string): Promise<string>;
	abstract queryWithImageHandling(
		prompt: string,
		image: string,
	): Promise<string>;
	abstract generateSettings(
		containerEl: HTMLElement,
		plugin: AIAdapterPlugin,
	): void;

	setLastModel(model: Models) {
		this.lastModel = model;
	}

	setLastImageModel(model: Models) {
		this.lastImageModel = model;
	}
}
