import { settings } from "./settings";
import { Provider } from "./provider";
import { OllamaProvider } from "./providers/ollamaProvider";
// import {ExampleProvider} from "./exampleProvider"; [NEW PROVIDER]

export function debugLog(message: object | string) {
	if (settings.debug) {
		console.log(message);
	}
}

export function initProvider(): Provider {
	switch (settings.provider) {
		case "ollama": {
			return new OllamaProvider();
		}
		// case "testing": { [NEW PROVIDER]
		// 	return new ExampleProvider();
		// }
	}
}
