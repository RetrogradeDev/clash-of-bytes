import type { Metadata } from "next";
import Settings from "./form";

export const metadata: Metadata = {
	title: "Settings - Clash of Bytes",
	description: "Manage your account settings",
};

const SettingsPage = () => {
	return <Settings />;
};

export default SettingsPage;
