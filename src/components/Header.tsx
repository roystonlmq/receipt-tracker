import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Menu, Image, Info, X, Receipt, Hash, LogOut, User, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/server/auth";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const { user, devMode } = useAuth();

	const handleSignOut = async () => {
		try {
			const sessionId = localStorage.getItem("session_id") || undefined;
			await signOut({ data: { sessionId } });
			localStorage.removeItem("session_id");
			window.location.href = "/login"; // Use window.location for full page reload
		} catch (error) {
			console.error("Sign out failed:", error);
		}
	};

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
						search={{ query: undefined, folder: undefined }}
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

				{/* User Info and Sign Out */}
				<div className="p-4 border-t border-white/10 space-y-3">
					{devMode && (
						<div className="p-2 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex items-center gap-2">
							<AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
							<span className="text-xs text-yellow-300">Dev Mode Active</span>
						</div>
					)}

					{user && (
						<div className="space-y-3">
							<div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
								{user.picture ? (
									<img
										src={user.picture}
										alt={user.name}
										className="w-10 h-10 rounded-full"
									/>
								) : (
									<div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
										<User className="w-6 h-6 text-white" />
									</div>
								)}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-white truncate">
										{user.name}
									</p>
									<p className="text-xs text-white/60 truncate">{user.email}</p>
								</div>
							</div>

							<button
								type="button"
								onClick={handleSignOut}
								className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 rounded-lg transition-colors"
							>
								<LogOut className="w-4 h-4" />
								<span>Sign Out</span>
							</button>
						</div>
					)}

					<div className="flex items-center gap-2 text-xs text-white/40">
						<Info size={14} />
						<span>Press ESC to close menu</span>
					</div>
				</div>
			</aside>
		</>
	);
}
