
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, DollarSign, Receipt, AlertTriangle, Database, Plus, RefreshCw } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const Settings = () => {
  const { toast } = useToast();
  const { resetToSampleData, addSampleIndianData } = usePOS();
  const [generalSettings, setGeneralSettings] = useState({
    businessName: 'Cuephoria Gaming Center',
    address: '123 Gaming Street, Bangalore, Karnataka',
    phone: '9876543210',
    email: 'info@cuephoria.com',
    showReceipt: true,
  });
  
  const [billingSettings, setBillingSettings] = useState({
    ps5HourlyRate: '300',
    eightBallHourlyRate: '200',
    taxRate: '18',
    pointsPerRupee: '10',
  });
  
  const [resetOptions, setResetOptions] = useState({
    products: false,
    customers: false,
    sales: true,
    sessions: true,
  });
  
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setGeneralSettings(prev => ({ ...prev, showReceipt: checked }));
  };
  
  const handleSaveGeneral = () => {
    toast({
      title: 'Settings Saved',
      description: 'General settings have been updated successfully.',
    });
  };
  
  const handleSaveBilling = () => {
    toast({
      title: 'Settings Saved',
      description: 'Billing settings have been updated successfully.',
    });
  };
  
  const handleResetData = () => {
    // Use the resetToSampleData function from context with specific options
    resetToSampleData(resetOptions);
    
    // Build message based on what was reset
    const resetItems = [];
    if (resetOptions.products) resetItems.push('products');
    if (resetOptions.customers) resetItems.push('customers');
    if (resetOptions.sales) resetItems.push('bills');
    if (resetOptions.sessions) resetItems.push('sessions');
    
    toast({
      title: 'Data Reset',
      description: `Reset completed for: ${resetItems.join(', ')}`,
      variant: 'destructive',
    });
  };
  
  const handleQuickReset = () => {
    // Reset only transactions and sessions
    resetToSampleData({
      products: false,
      customers: false,
      sales: true,
      sessions: true
    });
    
    toast({
      title: 'Fresh Start',
      description: 'All transactions and sessions have been cleared',
    });
  };
  
  const handleAddSampleData = () => {
    // Call function to add sample Indian data
    addSampleIndianData();
    
    toast({
      title: 'Sample Data Added',
      description: 'Indian sample data has been added to your system.',
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <Button 
          onClick={handleQuickReset}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear All Sessions & Transactions
        </Button>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <User className="h-4 w-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="billing">
            <DollarSign className="h-4 w-4 mr-2" /> Billing
          </TabsTrigger>
          <TabsTrigger value="system">
            <Shield className="h-4 w-4 mr-2" /> System
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={generalSettings.businessName}
                  onChange={handleGeneralChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={generalSettings.address}
                  onChange={handleGeneralChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={generalSettings.phone}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={generalSettings.email}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showReceipt"
                  checked={generalSettings.showReceipt}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="showReceipt">Print receipt after transaction</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Billing</CardTitle>
              <CardDescription>
                Manage rates, taxes, and loyalty points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ps5HourlyRate">PS5 Hourly Rate (₹)</Label>
                  <Input
                    id="ps5HourlyRate"
                    name="ps5HourlyRate"
                    type="number"
                    value={billingSettings.ps5HourlyRate}
                    onChange={handleBillingChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="eightBallHourlyRate">8-Ball Hourly Rate (₹)</Label>
                  <Input
                    id="eightBallHourlyRate"
                    name="eightBallHourlyRate"
                    type="number"
                    value={billingSettings.eightBallHourlyRate}
                    onChange={handleBillingChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    name="taxRate"
                    type="number"
                    value={billingSettings.taxRate}
                    onChange={handleBillingChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pointsPerRupee">Loyalty Points (per ₹10 spent)</Label>
                  <Input
                    id="pointsPerRupee"
                    name="pointsPerRupee"
                    type="number"
                    value={billingSettings.pointsPerRupee}
                    onChange={handleBillingChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveBilling}>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Receipt Settings</CardTitle>
              <CardDescription>
                Customize the information shown on receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="showTax" defaultChecked />
                  <Label htmlFor="showTax">Show tax breakdown</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="showLoyalty" defaultChecked />
                  <Label htmlFor="showLoyalty">Show loyalty points earned</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="showThankYou" defaultChecked />
                  <Label htmlFor="showThankYou">Show thank you message</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Preview Receipt</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* System Settings */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Management</CardTitle>
              <CardDescription>
                Advanced system settings and data management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Data Backup</h3>
                <p className="text-sm text-muted-foreground">
                  Create a backup of all your data or restore from a previous backup
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline">Export Backup</Button>
                  <Button variant="outline">Import Backup</Button>
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-medium">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Common operations to manage your application data
                </p>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleQuickReset}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Clear All Sessions & Transactions
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-medium">Sample Data</h3>
                <p className="text-sm text-muted-foreground">
                  Add sample Indian data with realistic names, products, and sales records
                </p>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Sample Indian Data
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Sample Indian Data</DialogTitle>
                        <DialogDescription>
                          This will add new sample data with Indian names, products, and transactions to your system.
                          Existing data will not be modified.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          Sample data will include:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Customers with Indian names and contact information</li>
                          <li>Indian snacks and beverages as products</li>
                          <li>Sample bills and transactions</li>
                          <li>Gaming sessions with realistic durations</li>
                        </ul>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>Cancel</Button>
                        <Button onClick={handleAddSampleData}>Add Sample Data</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-medium">Data Reset</h3>
                <p className="text-sm text-muted-foreground">
                  Reset selected data in the system to default values. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="mt-2">
                      Reset Selected Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Reset Selected Data
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Select which data you want to reset to default values:
                        
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="resetProducts" 
                              checked={resetOptions.products}
                              onCheckedChange={(checked) => 
                                setResetOptions(prev => ({...prev, products: !!checked}))
                              }
                            />
                            <label
                              htmlFor="resetProducts"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Products - Reset all product data
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="resetCustomers" 
                              checked={resetOptions.customers}
                              onCheckedChange={(checked) => 
                                setResetOptions(prev => ({...prev, customers: !!checked}))
                              }
                            />
                            <label
                              htmlFor="resetCustomers"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Customers - Reset all customer data
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="resetSales" 
                              checked={resetOptions.sales}
                              onCheckedChange={(checked) => 
                                setResetOptions(prev => ({...prev, sales: !!checked}))
                              }
                            />
                            <label
                              htmlFor="resetSales"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Sales - Reset all bills and transactions
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="resetSessions" 
                              checked={resetOptions.sessions}
                              onCheckedChange={(checked) => 
                                setResetOptions(prev => ({...prev, sessions: !!checked}))
                              }
                            />
                            <label
                              htmlFor="resetSessions"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Sessions - Reset all gaming sessions
                            </label>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-2 bg-red-50 text-red-700 rounded-md">
                          This action cannot be undone. Selected data will be permanently deleted.
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleResetData}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={!Object.values(resetOptions).some(Boolean)}
                      >
                        Reset Selected Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
