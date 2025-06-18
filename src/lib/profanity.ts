import { Profanity } from "@2toad/profanity";

const profanity = new Profanity({
	languages: ["en", "hi", "es", "fr", "de", "pt", "ru", "ar", "zh"],
});

export function censor(text: string): string {
	return profanity.censor(text);
}
