import { Models } from "./types";
import PQueue from "p-queue";
import { Provider } from "./provider"; // Adjust the path as necessary

export function setProvider(p: Provider): void {
	provider = p;
}

export let provider: Provider;

export const possibleModels: Models[] = [
	{
		name: "llava-llama3 (8B) [default]",
		model: "llava-llama3:latest",
		imageReady: true,
		provider: "ollama",
	},
	{
		name: "llama3.2-vision (11B)",
		model: "llama3.2-vision:11b",
		imageReady: true,
		provider: "ollama",
	},
	{
		name: "llama3.2-vision (90B)",
		model: "llama3.2-vision:90b",
		imageReady: true,
		provider: "ollama",
	},
	{
		name: "llava (7B)",
		model: "llava:latest",
		imageReady: true,
		provider: "ollama",
	},
	{
		name: "llava (13B)",
		model: "llava:13b",
		imageReady: true,
		provider: "ollama",
	},
	{
		name: "llava (34B)",
		model: "llava:34b",
		imageReady: true,
		provider: "ollama",
	},
	{
		name: "llama3.3 (70B)",
		model: "llama3.3",
		imageReady: false,
		provider: "ollama",
	},
	{
		name: "deepseek-r1 (7B)",
		model: "deepseek-r1",
		imageReady: false,
		provider: "ollama",
	},
	{
		name: "llama3.2 (3B)",
		model: "llama3.2",
		imageReady: false,
		provider: "ollama",
	},
	{
		name: "llama3.2 (1B)",
		model: "llama3.2:1b",
		imageReady: false,
		provider: "ollama",
	},
	{
		name: "llama3.1 (8B)",
		model: "llama3.1",
		imageReady: false,
		provider: "ollama",
	},
	{
		name: "llama3.1 (70B)",
		model: "llama3.1:70b",
		imageReady: false,
		provider: "ollama",
	},
];

export const processQueue = new PQueue({ concurrency: 1, timeout: 600000 });

export let unsubscribeFunctionSetting: (() => void) | null = null;
export function setUnsubscribeFunctionSetting(fn: (() => void) | null) {
	unsubscribeFunctionSetting = fn;
}

// Simple event system for settings refresh
const modelsChangeListeners: Array<() => void> = [];

export function subscribeModelsChange(cb: () => void) {
	modelsChangeListeners.push(cb);
	return () => {
		const idx = modelsChangeListeners.indexOf(cb);
		if (idx > -1) modelsChangeListeners.splice(idx, 1);
	};
}

export function notifyModelsChange() {
	modelsChangeListeners.forEach((cb) => cb());
}
