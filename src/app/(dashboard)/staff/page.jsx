"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { staffAPI, expenseAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Search, DollarSign, History, Banknote, Receipt } from "lucide-react";

export default function StaffPage() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        role: "salesman",
        status: "active",
        salary: "",
    });
    const [submitting, setSubmitting] = useState(false);

    // Advance dialog state
    const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
    const [selectedStaffForAdvance, setSelectedStaffForAdvance] = useState(null);
    const [advanceAmount, setAdvanceAmount] = useState("");
    const [advanceNote, setAdvanceNote] = useState("");
    const [submittingAdvance, setSubmittingAdvance] = useState(false);

    // Salary dialog state
    const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
    const [selectedStaffForSalary, setSelectedStaffForSalary] = useState(null);
    const [salaryMonth, setSalaryMonth] = useState("");
    const [submittingSalary, setSubmittingSalary] = useState(false);

    // Ledger dialog state
    const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);
    const [ledgerData, setLedgerData] = useState(null);

    // Expense state
    const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [expenseData, setExpenseData] = useState({
        amount: "",
        reason: "",
        paidTo: "",
        date: new Date().toISOString().split('T')[0]
    });
    const [submittingExpense, setSubmittingExpense] = useState(false);
    const [totalExpenses, setTotalExpenses] = useState(0);

    // Dialog States
    const [deleteId, setDeleteId] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'staff' | 'expense'
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);

    useEffect(() => {
        fetchStaff();
        fetchExpenses();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await staffAPI.getAll();
            setStaff(response.data || []);
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExpenses = async () => {
        try {
            // Get today's date for default filter
            const today = new Date().toISOString().split('T')[0];
            const response = await expenseAPI.getAll({ from: today, to: today });
            setExpenses(response.data.expenses || []);
            setTotalExpenses(response.data.total || 0);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

    // Expense handlers
    const handleOpenExpenseDialog = () => {
        setExpenseData({
            amount: "",
            reason: "",
            paidTo: "",
            date: new Date().toISOString().split('T')[0]
        });
        setExpenseDialogOpen(true);
    };

    const handleSubmitExpense = async () => {
        if (!expenseData.amount || !expenseData.reason || !expenseData.paidTo) {
            setErrorMessage("Please fill all required fields");
            setErrorDialogOpen(true);
            return;
        }
        setSubmittingExpense(true);
        try {
            await expenseAPI.create({
                amount: parseFloat(expenseData.amount),
                reason: expenseData.reason,
                paidTo: expenseData.paidTo,
                date: expenseData.date
            });
            setErrorMessage("Expense recorded successfully!");
            setErrorDialogOpen(true);
            setExpenseDialogOpen(false);
            fetchExpenses();
        } catch (error) {
            console.error("Error recording expense:", error);
            setErrorMessage(error.response?.data?.message || "Failed to record expense");
            setErrorDialogOpen(true);
        } finally {
            setSubmittingExpense(false);
        }
    };

    const handleDeleteExpenseClick = (id) => {
        setDeleteId(id);
        setDeleteType('expense');
        setDeleteDialogOpen(true);
    };

    const handleOpenDialog = (s = null) => {
        if (s) {
            setEditingStaff(s);
            setFormData({
                name: s.name,
                phone: s.phone || "",
                role: s.role || "salesman",
                status: s.status || "active",
                salary: s.salary || "",
            });
        } else {
            setEditingStaff(null);
            setFormData({
                name: "",
                phone: "",
                role: "salesman",
                status: "active",
                salary: "",
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingStaff(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingStaff) {
                await staffAPI.update(editingStaff._id, formData);
            } else {
                await staffAPI.create(formData);
            }
            fetchStaff();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving staff:", error);
            setErrorMessage(error.response?.data?.message || "Failed to save staff");
            setErrorDialogOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteStaffClick = (id) => {
        setDeleteId(id);
        setDeleteType('staff');
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (deleteType === 'staff') {
                await staffAPI.delete(deleteId);
                fetchStaff();
            } else if (deleteType === 'expense') {
                await expenseAPI.delete(deleteId);
                fetchExpenses();
            }
        } catch (error) {
            console.error(`Error deleting ${deleteType}:`, error);
            setErrorMessage(error.response?.data?.message || `Failed to delete ${deleteType}`);
            setErrorDialogOpen(true);
        } finally {
            setDeleteDialogOpen(false);
            setDeleteId(null);
            setDeleteType(null);
        }
    };

    // Advance handlers
    const handleOpenAdvanceDialog = (s) => {
        setSelectedStaffForAdvance(s);
        setAdvanceAmount("");
        setAdvanceNote("");
        setAdvanceDialogOpen(true);
    };

    const handleSubmitAdvance = async () => {
        if (!advanceAmount || parseFloat(advanceAmount) <= 0) {
            setErrorMessage("Please enter a valid amount");
            setErrorDialogOpen(true);
            return;
        }
        setSubmittingAdvance(true);
        try {
            await staffAPI.recordAdvance(selectedStaffForAdvance._id, {
                amount: parseFloat(advanceAmount),
                note: advanceNote
            });
            setErrorMessage("Advance recorded successfully!");
            setErrorDialogOpen(true);
            setAdvanceDialogOpen(false);
            fetchStaff();
        } catch (error) {
            console.error("Error recording advance:", error);
            setErrorMessage(error.response?.data?.message || "Failed to record advance");
            setErrorDialogOpen(true);
        } finally {
            setSubmittingAdvance(false);
        }
    };

    // Salary handlers
    const handleOpenSalaryDialog = (s) => {
        setSelectedStaffForSalary(s);
        setSalaryMonth("");
        setSalaryDialogOpen(true);
    };

    const handleSubmitSalary = async () => {
        setSubmittingSalary(true);
        try {
            const response = await staffAPI.paySalary(selectedStaffForSalary._id, {
                month: salaryMonth
            });
            const summary = response.data.summary;
            setErrorMessage(`Salary paid: Gross ${formatCurrency(summary.grossSalary)}, Advance Deducted ${formatCurrency(summary.advanceDeducted)}, Net Paid ${formatCurrency(summary.netPaid)}`);
            setErrorDialogOpen(true);
            setSalaryDialogOpen(false);
            fetchStaff();
        } catch (error) {
            console.error("Error paying salary:", error);
            setErrorMessage(error.response?.data?.message || "Failed to pay salary");
            setErrorDialogOpen(true);
        } finally {
            setSubmittingSalary(false);
        }
    };

    // Ledger handler
    const handleViewLedger = async (s) => {
        try {
            const response = await staffAPI.getAdvances(s._id);
            setLedgerData(response.data);
            setLedgerDialogOpen(true);
        } catch (error) {
            console.error("Error fetching ledger:", error);
            setErrorMessage("Failed to load ledger history");
            setErrorDialogOpen(true);
        }
    };

    const filteredStaff = staff.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.phone && s.phone.includes(searchTerm))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent dark:border-zinc-50"></div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading staff...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Staff Management</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage salesmen and order bookers</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Staff
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Staff ({filteredStaff.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredStaff.length === 0 ? (
                        <p className="text-center text-sm text-zinc-500 py-8">
                            {searchTerm ? "No staff found matching your search." : "No staff found."}
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Salary</TableHead>
                                    <TableHead className="text-right">Advance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStaff.map((s) => (
                                    <TableRow key={s._id}>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell>{s.phone || "-"}</TableCell>
                                        <TableCell className="capitalize">{s.role.replace('_', ' ')}</TableCell>
                                        <TableCell className="text-right">
                                            {s.salary ? formatCurrency(s.salary) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {s.advanceBalance > 0 ? (
                                                <Badge variant="destructive">{formatCurrency(s.advanceBalance)}</Badge>
                                            ) : (
                                                <span className="text-zinc-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={s.status === "active" ? "success" : "secondary"}>
                                                {s.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenAdvanceDialog(s)}
                                                    title="Give Advance"
                                                >
                                                    <DollarSign className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenSalaryDialog(s)}
                                                    title="Pay Salary"
                                                    disabled={!s.salary}
                                                >
                                                    <Banknote className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewLedger(s)}
                                                    title="View History"
                                                >
                                                    <History className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(s)}
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteStaffClick(s._id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Daily Expenses Section */}
            <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                            <Receipt className="h-5 w-5" />
                            Today's Staff Expenses
                        </CardTitle>
                        <Button onClick={handleOpenExpenseDialog} className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Expense
                        </Button>
                    </div>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                        Daily payments to salesmen and order bookers. Total: <strong>{formatCurrency(totalExpenses)}</strong>
                    </p>
                </CardHeader>
                <CardContent className="pt-4">
                    {expenses.length === 0 ? (
                        <p className="text-center text-sm text-zinc-500 py-4">
                            No expenses recorded today.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Staff</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((exp) => (
                                    <TableRow key={exp._id}>
                                        <TableCell className="font-medium">{exp.staffName}</TableCell>
                                        <TableCell className="capitalize">{exp.staffRole?.replace('_', ' ')}</TableCell>
                                        <TableCell>{exp.reason}</TableCell>
                                        <TableCell className="text-right font-bold text-orange-600">
                                            {formatCurrency(exp.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteExpenseClick(exp._id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add Expense Dialog */}
            <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                <DialogContent>
                    <DialogClose onClick={() => setExpenseDialogOpen(false)} />
                    <DialogHeader>
                        <DialogTitle>Record Staff Expense</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="expensePaidTo">Paid To *</Label>
                            <select
                                id="expensePaidTo"
                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                value={expenseData.paidTo}
                                onChange={(e) => setExpenseData({ ...expenseData, paidTo: e.target.value })}
                            >
                                <option value="">Select staff member</option>
                                {staff.filter(s => ['salesman', 'order_booker'].includes(s.role)).map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.name} ({s.role.replace('_', ' ')})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expenseAmount">Amount *</Label>
                            <Input
                                id="expenseAmount"
                                type="number"
                                value={expenseData.amount}
                                onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                                placeholder="Enter amount"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expenseReason">Reason *</Label>
                            <Input
                                id="expenseReason"
                                value={expenseData.reason}
                                onChange={(e) => setExpenseData({ ...expenseData, reason: e.target.value })}
                                placeholder="e.g., Daily allowance, Travel expense"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expenseDate">Date</Label>
                            <Input
                                id="expenseDate"
                                type="date"
                                value={expenseData.date}
                                onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setExpenseDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmitExpense} disabled={submittingExpense} className="bg-orange-600 hover:bg-orange-700">
                                {submittingExpense ? "Recording..." : "Record Expense"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogClose onClick={handleCloseDialog} />
                    <DialogHeader>
                        <DialogTitle>
                            {editingStaff ? "Edit Staff" : "Add New Staff"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <select
                                id="role"
                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="salesman">Salesman (Delivery By)</option>
                                <option value="order_booker">Order Booker (Order By)</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="salary">Monthly Salary</Label>
                            <Input
                                id="salary"
                                type="number"
                                value={formData.salary}
                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                placeholder="0"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Saving..." : editingStaff ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Advance Dialog */}
            <Dialog open={advanceDialogOpen} onOpenChange={setAdvanceDialogOpen}>
                <DialogContent>
                    <DialogClose onClick={() => setAdvanceDialogOpen(false)} />
                    <DialogHeader>
                        <DialogTitle>Record Advance Payment</DialogTitle>
                    </DialogHeader>
                    {selectedStaffForAdvance && (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                                <p className="text-sm text-zinc-500">Staff Member</p>
                                <p className="font-medium">{selectedStaffForAdvance.name}</p>
                                <p className="text-sm text-zinc-500 mt-2">Current Advance Balance</p>
                                <p className="font-bold text-red-600">{formatCurrency(selectedStaffForAdvance.advanceBalance || 0)}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="advanceAmount">Advance Amount *</Label>
                                <Input
                                    id="advanceAmount"
                                    type="number"
                                    value={advanceAmount}
                                    onChange={(e) => setAdvanceAmount(e.target.value)}
                                    placeholder="Enter amount"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="advanceNote">Note (Optional)</Label>
                                <Input
                                    id="advanceNote"
                                    value={advanceNote}
                                    onChange={(e) => setAdvanceNote(e.target.value)}
                                    placeholder="e.g., For medical emergency"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setAdvanceDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmitAdvance} disabled={submittingAdvance}>
                                    {submittingAdvance ? "Recording..." : "Record Advance"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Salary Dialog */}
            <Dialog open={salaryDialogOpen} onOpenChange={setSalaryDialogOpen}>
                <DialogContent>
                    <DialogClose onClick={() => setSalaryDialogOpen(false)} />
                    <DialogHeader>
                        <DialogTitle>Pay Salary</DialogTitle>
                    </DialogHeader>
                    {selectedStaffForSalary && (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                                <p className="font-medium text-lg">{selectedStaffForSalary.name}</p>
                            </div>

                            <div className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                                <div className="flex justify-between">
                                    <span>Gross Salary:</span>
                                    <span className="font-medium">{formatCurrency(selectedStaffForSalary.salary || 0)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Advance Deduction:</span>
                                    <span className="font-medium">-{formatCurrency(selectedStaffForSalary.advanceBalance || 0)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                    <span>Net Payable:</span>
                                    <span className="text-green-600">
                                        {formatCurrency((selectedStaffForSalary.salary || 0) - (selectedStaffForSalary.advanceBalance || 0))}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salaryMonth">Month (Optional)</Label>
                                <Input
                                    id="salaryMonth"
                                    value={salaryMonth}
                                    onChange={(e) => setSalaryMonth(e.target.value)}
                                    placeholder="e.g., January 2024"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setSalaryDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmitSalary} disabled={submittingSalary}>
                                    {submittingSalary ? "Processing..." : "Pay Salary"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Ledger History Dialog */}
            <Dialog open={ledgerDialogOpen} onOpenChange={setLedgerDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogClose onClick={() => setLedgerDialogOpen(false)} />
                    <DialogHeader>
                        <DialogTitle>Payment History</DialogTitle>
                    </DialogHeader>
                    {ledgerData && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                                <div>
                                    <p className="text-sm text-zinc-500">Staff</p>
                                    <p className="font-medium">{ledgerData.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">Monthly Salary</p>
                                    <p className="font-medium">{formatCurrency(ledgerData.salary)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">Current Advance</p>
                                    <p className="font-bold text-red-600">{formatCurrency(ledgerData.advanceBalance)}</p>
                                </div>
                            </div>

                            {ledgerData.ledger && ledgerData.ledger.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Note</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...ledgerData.ledger].reverse().map((entry, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        entry.type === 'advance' ? 'destructive' :
                                                            entry.type === 'salary' ? 'success' :
                                                                entry.type === 'payment' ? 'default' :
                                                                    'secondary'
                                                    }>
                                                        {entry.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{entry.note}</TableCell>
                                                <TableCell className={`text-right font-medium ${entry.amount < 0 ? 'text-red-600' : entry.type === 'advance' ? 'text-red-600' : 'text-green-600'}`}>
                                                    {entry.amount < 0 ? '' : entry.type === 'advance' ? '-' : '+'}{formatCurrency(Math.abs(entry.amount))}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center text-zinc-500 py-8">No payment history found.</p>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>


            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this {deleteType}? This action cannot be undone.</p>
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
        </div >
    );
}
