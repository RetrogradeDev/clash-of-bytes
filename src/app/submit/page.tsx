import type { Metadata } from "next";
import { SubmitPuzzleForm } from "./form";

export const metadata: Metadata = {
	title: "Submit a Puzzle - Clash of Bytes",
	description:
		"Create and submit your own programming puzzles for the Clash of Bytes community to solve. Share your challenges and test your coding skills!",
};

export default function SubmitPage() {
	return <SubmitPuzzleForm />;
}
