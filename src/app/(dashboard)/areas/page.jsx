"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { areaAPI } from "@/lib/api";
import { Plus, Trash2, Pencil, Save, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function AreasPage() {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentArea, setCurrentArea] = useState(null);
    const [formData, setFormData] = useState({ name: "" });

    // Dialog States
    const [deleteId, setDeleteId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        try {
            setLoading(true);
            const res = await areaAPI.getAll();
            setAreas(res.data);
        } catch (error) {
            console.error("Failed to fetch areas", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentArea) {
                await areaAPI.update(currentArea._id, formData);
            } else {
                await areaAPI.create(formData);
            }
            setIsDialogOpen(false);
            resetForm();
            fetchAreas();
        } catch (error) {
            console.error("Failed to save area", error);
            setErrorMessage(error.response?.data?.message || "Failed to save area");
            setErrorDialogOpen(true);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await areaAPI.delete(deleteId);
            fetchAreas();
        } catch (error) {
            console.error("Failed to delete area", error);
            setErrorMessage("Failed to delete area");
            setErrorDialogOpen(true);
        } finally {
            setDeleteDialogOpen(false);
            setDeleteId(null);
        }
    };

    const openEdit = (area) => {
        setCurrentArea(area);
        setFormData({ name: area.name });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setCurrentArea(null);
        setFormData({ name: "" });
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Area Management</h1>
                    <p className="text-zinc-500">Manage delivery and customer areas</p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Area
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentArea ? "Edit Area" : "Add New Area"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Area Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Nowshera"
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Areas List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {areas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                                        No areas found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                areas.map((area) => (
                                    <TableRow key={area._id}>
                                        <TableCell className="font-medium">{area.name}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(area)}>
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(area._id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this area? This action cannot be undone.</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Error/Info Dialog */}
            <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Info</DialogTitle>
                    </DialogHeader>
                    <p>{errorMessage}</p>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setErrorDialogOpen(false)}>OK</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
