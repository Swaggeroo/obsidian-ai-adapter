import AIAdapterPlugin from "./main";
import {OllamaProvider} from "./ollamaProvider";
import {settings} from "./settings";

export abstract class Provider {
	abstract queryHandling(prompt: string): Promise<string>;
	abstract queryWithImageHandling(prompt: string, image: string): Promise<string>;
	static generateSettings(containerEl: HTMLElement, plugin: AIAdapterPlugin): void{
		throw new Error("Method not implemented.");
	}
}

export function initProvider(): Provider{
	switch (settings.provider){
		case "ollama":
			return new OllamaProvider();
	}
}

export {}
