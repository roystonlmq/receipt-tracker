/**
 * Example usage of ConfirmDialog component
 * 
 * This file demonstrates how to integrate the ConfirmDialog
 * into your components for delete operations.
 */

import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

export function ExampleUsage() {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<number | null>(null);

	const handleDeleteClick = (id: number) => {
		setItemToDelete(id);
		setIsDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (itemToDelete !== null) {
			// Perform the actual delete operation
			console.log("Deleting item:", itemToDelete);
			// await deleteScreenshot({ id: itemToDelete, userId });
		}
		setIsDeleteDialogOpen(false);
		setItemToDelete(null);
	};

	const handleCancelDelete = () => {
		setIsDeleteDialogOpen(false);
		setItemToDelete(null);
	};

	return (
		<div>
			<button onClick={() => handleDeleteClick(1)}>
				Delete Screenshot
			</button>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				title="Delete Screenshot"
				message="Are you sure you want to delete this screenshot? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
			/>
		</div>
	);
}

/**
 * Example for batch delete operations
 */
export function BatchDeleteExample() {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3]);

	const handleBatchDelete = async () => {
		// Perform batch delete
		console.log("Deleting screenshots:", selectedIds);
		// await batchDeleteScreenshots({ ids: selectedIds, userId });
		setIsDeleteDialogOpen(false);
		setSelectedIds([]);
	};

	return (
		<div>
			<button onClick={() => setIsDeleteDialogOpen(true)}>
				Delete {selectedIds.length} Screenshots
			</button>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				title="Delete Multiple Screenshots"
				message={`Are you sure you want to delete ${selectedIds.length} screenshots? This action cannot be undone.`}
				confirmText="Delete All"
				cancelText="Cancel"
				onConfirm={handleBatchDelete}
				onCancel={() => setIsDeleteDialogOpen(false)}
			/>
		</div>
	);
}
