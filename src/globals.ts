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
];

export const processQueue = new PQueue({ concurrency: 1, timeout: 600000 });
