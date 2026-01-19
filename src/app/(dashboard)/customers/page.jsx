"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { customerAPI, areaAPI, paymentAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2, Eye, Search, DollarSign } from "lucide-react";
import { Select } from "@/components/ui/select";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    area: "",
    cnic: "",
    licenseNo: "",
    customerNo: "",
    openingBalance: "",  // For new customers - previous outstanding balance
  });
  const [submitting, setSubmitting] = useState(false);

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "cash",
    reference: "",
    note: "",
    transactionId: "",
    bankName: "",
  });

  // Dialog States
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const [response, areasResponse] = await Promise.all([
        customerAPI.getAll({ page: 1, limit: 1000 }),
        areaAPI.getAll()
      ]);
      setCustomers(response.data.data.customers || []);
      setAreas(areasResponse.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        area: customer.area || "",
        cnic: customer.cnic || "",
        licenseNo: customer.licenseNo || "",
        customerNo: customer.customerNo || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        area: "",
        cnic: "",
        licenseNo: "",
        customerNo: "",
        openingBalance: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
        openingBalance: !editingCustomer && formData.openingBalance ? parseFloat(formData.openingBalance) : undefined,
      };

      if (editingCustomer) {
        await customerAPI.update(editingCustomer._id, payload);
      } else {
        await customerAPI.create(payload);
      }
      fetchCustomers();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving customer:", error);
      setErrorMessage(error.response?.data?.message || "Failed to save customer");
      setErrorDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await customerAPI.delete(deleteId);
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      setErrorMessage(error.response?.data?.message || "Failed to delete customer");
      setErrorDialogOpen(true);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleViewLedger = async (customer) => {
    try {
      setSelectedCustomer(customer);
      const response = await customerAPI.getLedger(customer._id);
      setLedger(response.data.ledger || []);
      setLedgerDialogOpen(true);
    } catch (error) {

      console.error("Error fetching ledger:", error);
      setErrorMessage("Failed to fetch ledger");
      setErrorDialogOpen(true);
    }
  };

  // Payment handlers
  const handleOpenPaymentDialog = (customer) => {
    setPaymentCustomer(customer);
    setPaymentData({
      amount: "",
      paymentMethod: "cash",
      reference: "",
      note: "",
      transactionId: "",
      bankName: "",
    });
    setPaymentDialogOpen(true);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      setErrorMessage("Please enter a valid amount");
      setErrorDialogOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      await paymentAPI.createCustomerPayment({
        customerId: paymentCustomer._id,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.reference,
        note: paymentData.note,
        transactionId: paymentData.transactionId,
        bankName: paymentData.bankName,
      });
      setErrorMessage("Payment recorded successfully!");
      setErrorDialogOpen(true);
      setPaymentDialogOpen(false);
      fetchCustomers(); // Refresh to show updated balance
    } catch (error) {
      console.error("Error recording payment:", error);
      setErrorMessage(error.response?.data?.message || "Failed to record payment");
      setErrorDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent dark:border-zinc-50"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage customer information and ledgers</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search customers by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-8">
              {searchTerm ? "No customers found matching your search." : "No customers found. Add your first customer to get started."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell>{customer.area || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={customer.balance > 0 ? "destructive" : "secondary"}>
                        {formatCurrency(customer.balance || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {customer.balance > 0 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenPaymentDialog(customer)}
                            title="Receive Payment"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewLedger(customer)}
                          title="View Ledger"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(customer)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(customer._id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogClose onClick={handleCloseDialog} />
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., 1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <select
                  id="area"
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                >
                  <option value="">Select Area</option>
                  {areas.map((a) => (
                    <option key={a._id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerNo">Customer #</Label>
                <Input
                  id="customerNo"
                  value={formData.customerNo}
                  onChange={(e) => setFormData({ ...formData, customerNo: e.target.value })}
                  placeholder="Customer number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC</Label>
                <Input
                  id="cnic"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  placeholder="CNIC number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNo">License #</Label>
                <Input
                  id="licenseNo"
                  value={formData.licenseNo}
                  onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                  placeholder="License number"
                />
              </div>
            </div>

            {/* Opening Balance - Only for new customers */}
            {!editingCustomer && (
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <Label htmlFor="openingBalance" className="text-amber-800 dark:text-amber-200">
                  Opening Balance (Previous Outstanding)
                </Label>
                <Input
                  id="openingBalance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                  placeholder="0.00"
                  className="border-amber-300 dark:border-amber-700"
                />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Enter any previous outstanding balance if migrating from another system. Leave empty or 0 for new customers.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingCustomer ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ledger Dialog */}
      <Dialog open={ledgerDialogOpen} onOpenChange={setLedgerDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogClose onClick={() => setLedgerDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>
              Customer Ledger - {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
              <span className="font-medium">Current Balance:</span>
              <Badge variant={selectedCustomer?.balance > 0 ? "destructive" : "secondary"} className="text-lg">
                {formatCurrency(selectedCustomer?.balance || 0)}
              </Badge>
            </div>

            {ledger.length === 0 ? (
              <p className="text-center text-sm text-zinc-500 py-8">No transactions found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    let runningBalance = 0;
                    return ledger.map((entry, index) => {
                      // Calculate running balance
                      // invoice/sale adds to balance, payment reduces balance
                      if (entry.type === 'invoice' || entry.type === 'sale') {
                        runningBalance += Math.abs(entry.amount || 0);
                      } else if (entry.type === 'payment') {
                        runningBalance -= Math.abs(entry.amount || 0);
                      } else {
                        runningBalance += (entry.amount || 0);
                      }

                      const isDebit = entry.type === 'invoice' || entry.type === 'sale';

                      return (
                        <TableRow key={index}>
                          <TableCell>{formatDate(entry.date)}</TableCell>
                          <TableCell>
                            <Badge variant={isDebit ? "destructive" : "default"}>
                              {entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.reference || "-"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{entry.note || "-"}</TableCell>
                          <TableCell className={`text-right font-medium ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                            {isDebit ? '+' : '-'}{formatCurrency(Math.abs(entry.amount || 0))}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(runningBalance)}
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })()}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setPaymentDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Receive Payment - {paymentCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800 mb-4">
            <div className="flex justify-between">
              <span>Outstanding Balance:</span>
              <span className="font-bold text-red-600">{formatCurrency(paymentCustomer?.balance || 0)}</span>
            </div>
          </div>
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Amount *</Label>
              <Input
                id="paymentAmount"
                type="number"
                min="1"
                max={paymentCustomer?.balance || 0}
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                placeholder="Enter payment amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                id="paymentMethod"
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentReference">Reference (Cheque # / Transaction ID)</Label>
              <Input
                id="paymentReference"
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNote">Note</Label>
              <Input
                id="paymentNote"
                value={paymentData.note}
                onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                placeholder="Optional note"
              />
            </div>

            {/* Payment Tracking Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                  placeholder="e.g., TXN-12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={paymentData.bankName}
                  onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                  placeholder="e.g., HBL, MCB, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Processing..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
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

