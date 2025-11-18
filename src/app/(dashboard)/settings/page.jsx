"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [shopSettings, setShopSettings] = useState({
    shopName: "",
    address: "",
    phone: "",
    email: "",
    gst: "",
  });

  const [billSettings, setBillSettings] = useState({
    showLogo: false,
    showGST: true,
    footerText: "Thank you for your business!",
    termsAndConditions: "",
  });

  const [creditSettings, setCreditSettings] = useState({
    defaultCreditLimit: 0,
    creditDays: 30,
    enableCreditAlert: true,
  });

  const [printerSettings, setPrinterSettings] = useState({
    printerName: "Default",
    paperSize: "A4",
    autoPrint: false,
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedShopSettings = localStorage.getItem("shopSettings");
    const savedBillSettings = localStorage.getItem("billSettings");
    const savedCreditSettings = localStorage.getItem("creditSettings");
    const savedPrinterSettings = localStorage.getItem("printerSettings");

    if (savedShopSettings) setShopSettings(JSON.parse(savedShopSettings));
    if (savedBillSettings) setBillSettings(JSON.parse(savedBillSettings));
    if (savedCreditSettings) setCreditSettings(JSON.parse(savedCreditSettings));
    if (savedPrinterSettings) setPrinterSettings(JSON.parse(savedPrinterSettings));
  }, []);

  const handleSaveShopSettings = () => {
    localStorage.setItem("shopSettings", JSON.stringify(shopSettings));
    alert("Shop settings saved successfully!");
  };

  const handleSaveBillSettings = () => {
    localStorage.setItem("billSettings", JSON.stringify(billSettings));
    alert("Bill settings saved successfully!");
  };

  const handleSaveCreditSettings = () => {
    localStorage.setItem("creditSettings", JSON.stringify(creditSettings));
    alert("Credit settings saved successfully!");
  };

  const handleSavePrinterSettings = () => {
    localStorage.setItem("printerSettings", JSON.stringify(printerSettings));
    alert("Printer settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your shop configuration</p>
      </div>

      {/* Shop Information */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                value={shopSettings.shopName}
                onChange={(e) => setShopSettings({ ...shopSettings, shopName: e.target.value })}
                placeholder="My Shop"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={shopSettings.phone}
                onChange={(e) => setShopSettings({ ...shopSettings, phone: e.target.value })}
                placeholder="1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={shopSettings.email}
                onChange={(e) => setShopSettings({ ...shopSettings, email: e.target.value })}
                placeholder="shop@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst">GST Number</Label>
              <Input
                id="gst"
                value={shopSettings.gst}
                onChange={(e) => setShopSettings({ ...shopSettings, gst: e.target.value })}
                placeholder="GST123456789"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={shopSettings.address}
                onChange={(e) => setShopSettings({ ...shopSettings, address: e.target.value })}
                placeholder="123 Main Street, City, State"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveShopSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Shop Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bill Format Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Bill Format Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showLogo"
                checked={billSettings.showLogo}
                onChange={(e) => setBillSettings({ ...billSettings, showLogo: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <Label htmlFor="showLogo" className="cursor-pointer">Show Logo on Bill</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showGST"
                checked={billSettings.showGST}
                onChange={(e) => setBillSettings({ ...billSettings, showGST: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <Label htmlFor="showGST" className="cursor-pointer">Show GST on Bill</Label>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="footerText">Footer Text</Label>
              <Input
                id="footerText"
                value={billSettings.footerText}
                onChange={(e) => setBillSettings({ ...billSettings, footerText: e.target.value })}
                placeholder="Thank you for your business!"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
              <textarea
                id="termsAndConditions"
                value={billSettings.termsAndConditions}
                onChange={(e) => setBillSettings({ ...billSettings, termsAndConditions: e.target.value })}
                placeholder="Enter terms and conditions..."
                className="w-full rounded-md border border-zinc-200 p-2 dark:border-zinc-800 dark:bg-zinc-950"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveBillSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Bill Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credit Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultCreditLimit">Default Credit Limit (₹)</Label>
              <Input
                id="defaultCreditLimit"
                type="number"
                value={creditSettings.defaultCreditLimit}
                onChange={(e) => setCreditSettings({ ...creditSettings, defaultCreditLimit: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditDays">Credit Days</Label>
              <Input
                id="creditDays"
                type="number"
                value={creditSettings.creditDays}
                onChange={(e) => setCreditSettings({ ...creditSettings, creditDays: parseInt(e.target.value) || 0 })}
                placeholder="30"
              />
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <input
                type="checkbox"
                id="enableCreditAlert"
                checked={creditSettings.enableCreditAlert}
                onChange={(e) => setCreditSettings({ ...creditSettings, enableCreditAlert: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <Label htmlFor="enableCreditAlert" className="cursor-pointer">Enable Credit Limit Alerts</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveCreditSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Credit Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Printer Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Printer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="printerName">Printer Name</Label>
              <Input
                id="printerName"
                value={printerSettings.printerName}
                onChange={(e) => setPrinterSettings({ ...printerSettings, printerName: e.target.value })}
                placeholder="Default"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paperSize">Paper Size</Label>
              <Select
                id="paperSize"
                value={printerSettings.paperSize}
                onChange={(e) => setPrinterSettings({ ...printerSettings, paperSize: e.target.value })}
              >
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="thermal">Thermal (80mm)</option>
              </Select>
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <input
                type="checkbox"
                id="autoPrint"
                checked={printerSettings.autoPrint}
                onChange={(e) => setPrinterSettings({ ...printerSettings, autoPrint: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <Label htmlFor="autoPrint" className="cursor-pointer">Auto Print After Sale</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSavePrinterSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Printer Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Settings are currently stored locally in your browser.
          For multi-device sync, backend API integration is recommended.
        </p>
      </div>
    </div>
  );
}

