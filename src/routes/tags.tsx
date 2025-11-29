import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TagList } from "@/components/TagList";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/tags")({
	component: TagsPage,
});

function TagsPage() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const handleTagClick = (tag: string) => {
		// Navigate to screenshots page with tag search
		// Ensure tag has # prefix for search
		const searchQuery = tag.startsWith("#") ? tag : `#${tag}`;
		navigate({
			to: "/screenshots",
			search: { query: searchQuery },
		});
	};

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">Your Tags</h1>
					<p className="text-white/60">
						View and manage all your hashtags. Click a tag to see related
						screenshots.
					</p>
				</div>

				<TagList userId={user?.id || 1} onTagClick={handleTagClick} />
			</main>
		</div>
		</AuthGuard>
	);
}
