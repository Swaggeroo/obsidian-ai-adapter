export type Models = {
	name: string
	model: string
	imageReady: boolean
	provider: Providers
}

export type Providers = "ollama"// | "gemini"

export const providerNames: Providers[] = ["ollama"];//, "gemini"];
