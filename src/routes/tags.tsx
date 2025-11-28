import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TagList } from "@/components/TagList";
import Header from "@/components/Header";

export const Route = createFileRoute("/tags")({
	component: TagsPage,
});

function TagsPage() {
	const navigate = useNavigate();
	const [userId] = useState(1); // TODO: Get from auth context

	const handleTagClick = (tag: string) => {
		// Navigate to screenshots page with tag search
		navigate({
			to: "/screenshots",
			search: { query: tag },
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
			<Header />

			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">Your Tags</h1>
					<p className="text-white/60">
						View and manage all your hashtags. Click a tag to see related
						screenshots.
					</p>
				</div>

				<TagList userId={userId} onTagClick={handleTagClick} />
			</main>
		</div>
	);
}
