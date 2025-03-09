import {processQueue, provider} from "./globals";
import {debugLog} from "./util";
import {Notice} from "obsidian";

export async function query(prompt: string): Promise<string> {
	if (!provider){
		debugLog("Provider not initialized");
		new Notice('Provider not initialized');
		return '';
	}

	try {
		return await processQueue.add(() => provider.queryHandling(prompt)) ?? '';
	}catch (e) {
		debugLog(e);
		return '';
	}
}

export async function queryWithImage(prompt: string, image: string): Promise<string> {
	if (!provider){
		debugLog("Provider not initialized");
		new Notice('Provider not initialized');
		return '';
	}

	try {
		return await processQueue.add(() => provider.queryWithImageHandling(prompt, image)) ?? '';
	}catch (e) {
		debugLog(e);
		return '';
	}
}
