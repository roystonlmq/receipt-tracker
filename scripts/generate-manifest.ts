import fs from "node:fs";
import path from "node:path";

// Read app name from environment or use default
const appName = process.env.VITE_APP_NAME || "Receipts Tracker";
const appShortName = appName.length > 12 ? appName.substring(0, 12) : appName;

const manifest = {
	short_name: appShortName,
	name: appName,
	icons: [
		{
			src: "favicon.ico",
			sizes: "64x64 32x32 24x24 16x16",
			type: "image/x-icon",
		},
		{
			src: "logo192.png",
			type: "image/png",
			sizes: "192x192",
		},
		{
			src: "logo512.png",
			type: "image/png",
			sizes: "512x512",
		},
	],
	start_url: ".",
	display: "standalone",
	theme_color: "#000000",
	background_color: "#ffffff",
};

const manifestPath = path.join(process.cwd(), "public", "manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`✓ Generated manifest.json with app name: ${appName}`);
