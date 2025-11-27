import { useState, useEffect } from "react";
import { User, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "@/server/users";
import type { User as UserType } from "@/server/users";

interface UserProfileSelectorProps {
	currentUserId: number;
	onUserChange: (userId: number) => void;
}

export function UserProfileSelector({
	currentUserId,
	onUserChange,
}: UserProfileSelectorProps) {
	const [users, setUsers] = useState<UserType[]>([]);
	const [loading, setLoading] = useState(true);
	const [showManageModal, setShowManageModal] = useState(false);
	const [editingUserId, setEditingUserId] = useState<number | null>(null);
	const [editingName, setEditingName] = useState("");
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newUserName, setNewUserName] = useState("");
	const [newUserEmail, setNewUserEmail] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadUsers();
	}, []);

	// Handle ESC key to close modal
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && showManageModal) {
				setShowManageModal(false);
				setShowCreateForm(false);
				setError(null);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [showManageModal]);

	const loadUsers = async () => {
		try {
			setLoading(true);
			const result = await getUsers();
			setUsers(result);
		} catch (err) {
			console.error("Failed to load users:", err);
			setError("Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	const handleCreateUser = async () => {
		if (!newUserName.trim() || !newUserEmail.trim()) {
			setError("Name and email are required");
			return;
		}

		try {
			setError(null);
			const result = await createUser({
				data: { name: newUserName.trim(), email: newUserEmail.trim() },
			});

			if (result.success && result.user) {
				// Optimistically add the new user to the list
				setUsers((prevUsers) => [...prevUsers, result.user]);
				
				// Clear form and close it
				setShowCreateForm(false);
				setNewUserName("");
				setNewUserEmail("");
				
				// Switch to the new user
				onUserChange(result.user.id);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create user");
		}
	};

	const handleUpdateUser = async (id: number, name: string) => {
		if (!name.trim()) {
			setError("Name cannot be empty");
			return;
		}

		try {
			setError(null);
			
			// Optimistically update the UI immediately
			setUsers((prevUsers) =>
				prevUsers.map((u) =>
					u.id === id ? { ...u, name: name.trim() } : u,
				),
			);
			
			// Exit edit mode immediately for smooth transition
			setEditingUserId(null);
			setEditingName("");
			
			// Update on server in background
			await updateUser({ data: { id, name: name.trim() } });
		} catch (err) {
			// If server update fails, reload to get correct state
			setError(err instanceof Error ? err.message : "Failed to update user");
			await loadUsers();
		}
	};

	const handleDeleteUser = async (id: number) => {
		if (
			!confirm(
				"Are you sure you want to delete this profile? This action cannot be undone.",
			)
		) {
			return;
		}

		try {
			setError(null);
			
			// If deleting current user, switch to first available user first
			if (id === currentUserId && users.length > 1) {
				const nextUser = users.find((u) => u.id !== id);
				if (nextUser) {
					onUserChange(nextUser.id);
				}
			}
			
			// Optimistically remove from UI
			setUsers((prevUsers) => prevUsers.filter((u) => u.id !== id));
			
			// Delete on server in background
			await deleteUser({ data: { id } });
		} catch (err) {
			// If server delete fails, reload to get correct state
			setError(err instanceof Error ? err.message : "Failed to delete user");
			await loadUsers();
		}
	};

	if (loading) {
		return (
			<div className="flex items-center gap-2 text-white/60">
				<User className="w-5 h-5" />
				<span className="text-sm">Loading...</span>
			</div>
		);
	}

	return (
		<>
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2 text-white/60">
					<User className="w-5 h-5" />
					<span className="text-sm">Profile:</span>
				</div>
				<select
					value={currentUserId}
					onChange={(e) => onUserChange(Number(e.target.value))}
					className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white/15 transition-colors"
				>
					{users.map((user) => (
						<option key={user.id} value={user.id} className="bg-gray-900">
							{user.name}
						</option>
					))}
				</select>
				<button
					type="button"
					onClick={() => setShowManageModal(true)}
					className="px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white text-sm transition-colors"
				>
					Manage
				</button>
			</div>

			{/* Manage Profiles Modal */}
			{showManageModal && (
				<>
					<div
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
						onClick={() => {
							setShowManageModal(false);
							setShowCreateForm(false);
							setError(null);
						}}
					/>
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
						<div className="bg-gray-900 rounded-lg shadow-2xl border border-white/10 max-w-md w-full pointer-events-auto">
							{/* Header */}
							<div className="flex items-center justify-between p-4 border-b border-white/10">
								<h2 className="text-lg font-semibold text-white">
									Manage Profiles
								</h2>
								<button
									onClick={() => {
										setShowManageModal(false);
										setShowCreateForm(false);
										setError(null);
									}}
									className="p-2 hover:bg-white/10 rounded-lg transition-colors"
								>
									<X className="w-5 h-5 text-white/60" />
								</button>
							</div>

							{/* Content */}
							<div className="p-4 max-h-96 overflow-y-auto">
								{error && (
									<div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm">
										{error}
									</div>
								)}

								{/* User List */}
								<div className="space-y-2 mb-4">
									{users.map((user) => (
										<div
											key={user.id}
											className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
										>
											{editingUserId === user.id ? (
												<div className="flex-1 flex items-center gap-2">
													<input
														type="text"
														value={editingName}
														onChange={(e) => setEditingName(e.target.value)}
														className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
														autoFocus
													/>
													<button
														onClick={() =>
															handleUpdateUser(user.id, editingName)
														}
														className="p-1 hover:bg-white/10 rounded transition-colors"
													>
														<Check className="w-4 h-4 text-green-400" />
													</button>
													<button
														onClick={() => {
															setEditingUserId(null);
															setEditingName("");
														}}
														className="p-1 hover:bg-white/10 rounded transition-colors"
													>
														<X className="w-4 h-4 text-white/60" />
													</button>
												</div>
											) : (
												<>
													<div className="flex-1">
														<p className="text-white font-medium">{user.name}</p>
														<p className="text-white/40 text-xs">{user.email}</p>
													</div>
													<div className="flex items-center gap-1">
														<button
															onClick={() => {
																setEditingUserId(user.id);
																setEditingName(user.name);
															}}
															className="p-2 hover:bg-white/10 rounded transition-colors"
														>
															<Edit2 className="w-4 h-4 text-white/60" />
														</button>
														<button
															onClick={() => handleDeleteUser(user.id)}
															className="p-2 hover:bg-white/10 rounded transition-colors"
															disabled={users.length === 1}
														>
															<Trash2
																className={`w-4 h-4 ${users.length === 1 ? "text-white/20" : "text-red-400"}`}
															/>
														</button>
													</div>
												</>
											)}
										</div>
									))}
								</div>

								{/* Create New User Form */}
								{showCreateForm ? (
									<div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
										<h3 className="text-white font-medium">New Profile</h3>
										<input
											type="text"
											placeholder="Name"
											value={newUserName}
											onChange={(e) => setNewUserName(e.target.value)}
											className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
										<input
											type="email"
											placeholder="Email"
											value={newUserEmail}
											onChange={(e) => setNewUserEmail(e.target.value)}
											className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
										<div className="flex gap-2">
											<button
												onClick={handleCreateUser}
												className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
											>
												Create
											</button>
											<button
												onClick={() => {
													setShowCreateForm(false);
													setNewUserName("");
													setNewUserEmail("");
													setError(null);
												}}
												className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
											>
												Cancel
											</button>
										</div>
									</div>
								) : (
									<button
										onClick={() => setShowCreateForm(true)}
										className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white transition-colors"
									>
										<Plus className="w-4 h-4" />
										Create New Profile
									</button>
								)}
							</div>

							{/* Keyboard shortcut hint */}
							<div className="px-4 py-3 border-t border-white/10 bg-black/20">
								<div className="flex items-center gap-2 text-xs text-white/40">
									<kbd className="px-2 py-1 bg-white/10 rounded text-white/60">ESC</kbd>
									<span>Close</span>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}
