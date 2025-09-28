export type Models = {
	name: string;
	model: string;
	imageReady: boolean;
	provider: Providers;
};

export type Providers = "ollama"; // | "example" [NEW PROVIDER]

export const providerNames: Providers[] = ["ollama"]; //, "example"]; [NEW PROVIDER]
