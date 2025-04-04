# AI Adapter Plugin for Obsidian

This plugin is a core dependency for AI plugins in Obsidian. It provides a simple API to interact with AI services.

## Plugins using this adapter

- [AI Image Analyser (>0.2.0)](https://github.com/Swaggeroo/obsidian-ai-image-analyzer)

## Usage

### Ollama Proxys

Just use the Ollama URL in the settings. For example using [Open Web UI](https://docs.openwebui.com/) you can use the URL `http://[URL:PORT]/ollama` to access Ollama. You probably need to set a token (See Auth)

#### Auth

If your Proxy requires a token, you can set it in the settings.
It sets a `Authorization` header with the value of the token: `'Authorization': 'Bearer [Token]'`

## Installation

You can download the latest release from the GitHub [releases page](https://github.com/swaggeroo/obsidian-ai-adapter/releases) and install it manually in Obsidian.
In the future, this plugin will hopefully be available in the Obsidian community plugins.

## Using AI image analyser as a dependency for your plugin

The exposed API:

```typescript
// Add this type somewhere in your code
export type AIAdapterAPI = {
	query: (prompt: string) => Promise<string>;
	queryWithImage: (prompt: string, image: string) => Promise<string>;
};

// Then, you can just use this function to get the API
export function getAIAdapter(): AIAdapterAPI | undefined {
	return (app as any).plugins?.plugins?.["ai-adapter"]?.api;
}

// And use it like this
const text1 = await getAIAdapter()?.query(prompt);
const text2 = await getAIAdapter()?.queryWithImage(prompt, base64String);
```
