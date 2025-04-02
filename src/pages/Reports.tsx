
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Users, Clock, CreditCard } from 'lucide-react';
import { usePOS, Bill, Customer } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';

const Reports = () => {
  const { bills, customers, exportBills, exportCustomers } = usePOS();

  // Sort bills by date (newest first)
  const sortedBills = [...bills].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get customer name by ID
  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown Customer';
  };

  // Format play time
  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportBills}>
            <Download className="h-4 w-4 mr-2" /> Export Bills
          </Button>
          <Button variant="outline" onClick={exportCustomers}>
            <Download className="h-4 w-4 mr-2" /> Export Customers
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bills">
        <TabsList>
          <TabsTrigger value="bills">
            <CreditCard className="h-4 w-4 mr-2" /> Bills
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" /> Customers
          </TabsTrigger>
        </TabsList>
        
        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all transactions and their details</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Date & Time</th>
                      <th className="text-left p-3">Bill ID</th>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Items</th>
                      <th className="text-right p-3">Subtotal</th>
                      <th className="text-right p-3">Discount</th>
                      <th className="text-right p-3">Points Used</th>
                      <th className="text-right p-3">Total</th>
                      <th className="text-center p-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBills.length > 0 ? (
                      sortedBills.map((bill) => (
                        <tr key={bill.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="font-medium">{formatDate(bill.createdAt)}</div>
                            <div className="text-sm text-muted-foreground">{formatTime(bill.createdAt)}</div>
                          </td>
                          <td className="p-3 text-sm">{bill.id}</td>
                          <td className="p-3">{getCustomerName(bill.customerId)}</td>
                          <td className="p-3">
                            <div className="text-sm">
                              {bill.items.length} {bill.items.length === 1 ? 'item' : 'items'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {bill.items.map(item => item.name).join(', ')}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <CurrencyDisplay amount={bill.subtotal} />
                          </td>
                          <td className="p-3 text-right">
                            <CurrencyDisplay amount={bill.discount} />
                          </td>
                          <td className="p-3 text-right">{bill.loyaltyPointsUsed}</td>
                          <td className="p-3 text-right font-medium">
                            <CurrencyDisplay amount={bill.total} />
                          </td>
                          <td className="p-3 text-center">
                            <span className="capitalize">{bill.paymentMethod}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-muted-foreground">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Activity</CardTitle>
              <CardDescription>View all customers and their activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Contact</th>
                      <th className="text-center p-3">Member Status</th>
                      <th className="text-right p-3">Total Spent</th>
                      <th className="text-right p-3">Play Time</th>
                      <th className="text-right p-3">Loyalty Points</th>
                      <th className="text-left p-3">Joined On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length > 0 ? (
                      customers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{customer.name}</td>
                          <td className="p-3">
                            <div>{customer.phone}</div>
                            {customer.email && (
                              <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {customer.email}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              customer.isMember 
                                ? 'bg-cuephoria-purple/20 text-cuephoria-purple' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {customer.isMember ? 'Member' : 'Non-Member'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <CurrencyDisplay amount={customer.totalSpent} />
                          </td>
                          <td className="p-3 text-right">
                            {formatPlayTime(customer.totalPlayTime)}
                          </td>
                          <td className="p-3 text-right">{customer.loyaltyPoints}</td>
                          <td className="p-3">{formatDate(customer.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-muted-foreground">
                          No customers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
