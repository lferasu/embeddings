import { config } from "dotenv";

const { parsed, error } = config();

if (error) {
    throw new Error(`Failed to load .env: ${error.message}`);
}

const requireEnv = (name: string) => {
    const value = parsed?.[name]?.trim();

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
};

export const env = Object.freeze({
    chromaUrl: requireEnv("CHROMA_URL"),
    openAiApiKey: requireEnv("OPENAI_API_KEY"),
});
