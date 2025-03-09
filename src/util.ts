import { settings } from "./settings";

export function debugLog(message: object | string) {
	if (settings.debug) {
		console.log(message);
	}
}
