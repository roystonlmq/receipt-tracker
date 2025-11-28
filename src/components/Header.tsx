import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Menu, Image, Info, X, Receipt, Hash } from "lucide-react";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<header className="p-4 flex items-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg border-b border-white/10">
				<button
					onClick={() => setIsOpen(true)}
					className="p-2 hover:bg-white/10 rounded-lg transition-colors"
					aria-label="Open menu"
				>
					<Menu size={24} />
				</button>
				<h1 className="ml-4 text-xl font-semibold flex items-center gap-2">
					<Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
						<Receipt className="w-6 h-6 text-blue-400" />
						<span>Receipts Tracker</span>
					</Link>
				</h1>
			</header>

			<aside
				className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-white/10 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between p-4 border-b border-white/10">
					<div className="flex items-center gap-2">
						<Receipt className="w-6 h-6 text-blue-400" />
						<h2 className="text-xl font-bold">Receipts Tracker</h2>
					</div>
					<button
						onClick={() => setIsOpen(false)}
						className="p-2 hover:bg-white/10 rounded-lg transition-colors"
						aria-label="Close menu"
					>
						<X size={24} />
					</button>
				</div>

				<nav className="flex-1 p-4 overflow-y-auto">
					<Link
						to="/"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors mb-2"
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors mb-2",
						}}
					>
						<Home size={20} />
						<span className="font-medium">Home</span>
					</Link>

					<Link
						to="/screenshots"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors mb-2"
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors mb-2",
						}}
					>
						<Image size={20} />
						<span className="font-medium">My Screenshots</span>
					</Link>

					<Link
						to="/tags"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors mb-2"
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors mb-2",
						}}
					>
						<Hash size={20} />
						<span className="font-medium">Tags</span>
					</Link>

					<div className="mt-8 pt-4 border-t border-white/10">
						<div className="px-3 py-2 text-xs text-white/40 uppercase tracking-wider">
							About
						</div>
						<div className="p-3 text-sm text-white/60">
							<p className="mb-2">
								Organize your screenshots and receipts by date with automatic
								folder management.
							</p>
							<p className="text-xs text-white/40">
								Version 1.0.0
							</p>
						</div>
					</div>
				</nav>

				<div className="p-4 border-t border-white/10">
					<div className="flex items-center gap-2 text-xs text-white/40">
						<Info size={14} />
						<span>Press ESC to close menu</span>
					</div>
				</div>
			</aside>
		</>
	);
}
