import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt, Upload, Folder, Search, Download, Users } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
	return (
		<AuthGuard>
			<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
			<div className="container mx-auto px-4 py-16">
				{/* Hero Section */}
				<div className="text-center mb-16">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/20 rounded-full mb-6">
						<Receipt className="w-10 h-10 text-blue-400" />
					</div>
					<h1 className="text-5xl font-bold text-white mb-4">
						Receipts Tracker
					</h1>
					<p className="text-xl text-white/60 max-w-2xl mx-auto">
						Organize your screenshots and receipts by date with automatic folder management.
						Never lose track of important captures again.
					</p>
					<div className="mt-8">
						<Link
							to="/screenshots"
							search={{ query: undefined, folder: undefined }}
							className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-colors"
						>
							Get Started
						</Link>
					</div>
				</div>

				{/* Features Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
					{/* Feature 1 */}
					<div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
						<div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
							<Upload className="w-6 h-6 text-blue-400" />
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Easy Upload
						</h3>
						<p className="text-white/60 text-sm">
							Drag and drop or select multiple screenshots. Automatic naming with date and time stamps.
						</p>
					</div>

					{/* Feature 2 */}
					<div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
						<div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
							<Folder className="w-6 h-6 text-green-400" />
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Auto Organization
						</h3>
						<p className="text-white/60 text-sm">
							Screenshots automatically organized into date-based folders. Find what you need instantly.
						</p>
					</div>

					{/* Feature 3 */}
					<div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
						<div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
							<Search className="w-6 h-6 text-purple-400" />
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Quick Search
						</h3>
						<p className="text-white/60 text-sm">
							Search across all your screenshots by name. Filter and find receipts in seconds.
						</p>
					</div>

					{/* Feature 4 */}
					<div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
						<div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center mb-4">
							<Download className="w-6 h-6 text-yellow-400" />
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Batch Operations
						</h3>
						<p className="text-white/60 text-sm">
							Select multiple screenshots or folders. Download or delete in bulk with one click.
						</p>
					</div>

					{/* Feature 5 */}
					<div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
						<div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4">
							<Users className="w-6 h-6 text-red-400" />
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Multi-User Profiles
						</h3>
						<p className="text-white/60 text-sm">
							Create separate profiles for different users. Keep your receipts private and organized.
						</p>
					</div>

					{/* Feature 6 */}
					<div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
						<div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4">
							<Receipt className="w-6 h-6 text-cyan-400" />
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Add Notes
						</h3>
						<p className="text-white/60 text-sm">
							Attach notes to any screenshot. Export screenshots with notes as text files.
						</p>
					</div>
				</div>

				{/* Quick Start Guide */}
				<div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-lg p-8">
					<h2 className="text-2xl font-bold text-white mb-6 text-center">
						Quick Start Guide
					</h2>
					<div className="space-y-4">
						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
								1
							</div>
							<div>
								<h4 className="text-white font-medium mb-1">Upload Screenshots</h4>
								<p className="text-white/60 text-sm">
									Click "My Screenshots" and drag & drop your images or use the upload button.
								</p>
							</div>
						</div>
						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
								2
							</div>
							<div>
								<h4 className="text-white font-medium mb-1">Browse by Date</h4>
								<p className="text-white/60 text-sm">
									Your screenshots are automatically organized into folders by date.
								</p>
							</div>
						</div>
						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
								3
							</div>
							<div>
								<h4 className="text-white font-medium mb-1">Manage & Download</h4>
								<p className="text-white/60 text-sm">
									Rename, add notes, or download screenshots. Use batch operations for multiple items.
								</p>
							</div>
						</div>
					</div>
					<div className="mt-8 text-center">
						<Link
							to="/screenshots"
							search={{ query: undefined, folder: undefined }}
							className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
						>
							Go to My Screenshots
						</Link>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-16 text-center text-white/40 text-sm">
					<p>Press <kbd className="px-2 py-1 bg-white/10 rounded text-white/60">ESC</kbd> to navigate back • Use keyboard shortcuts for faster workflow</p>
				</div>
			</div>
		</div>
		</AuthGuard>
	);
}
