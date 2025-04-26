
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  User, Plus, Trash, Edit, Search, Gift, 
  Tag, Calendar, IndianRupee, FileText, Users
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import customer types
import { CustomerUser, Reward, Promotion } from "@/types/customer.types";
import { Customer } from "@/types/pos.types";
import { useCustomers } from "@/hooks/useCustomers";

const CustomerPortalManagement = () => {
  const [activeTab, setActiveTab] = useState("customers");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerUsers, setCustomerUsers] = useState<CustomerUser[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { customers: posCustomers } = useCustomers([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const usersJson = localStorage.getItem('customerUsers');
    if (usersJson) {
      try {
        const parsedUsers = JSON.parse(usersJson);
        setCustomerUsers(parsedUsers.map((user: any) => ({
          ...user, 
          created_at: new Date(user.created_at),
          reset_pin_expiry: user.reset_pin_expiry ? new Date(user.reset_pin_expiry) : undefined
        })));
      } catch (error) {
        console.error('Error parsing customer users:', error);
      }
    }

    // Load mock rewards
    setRewards([
      {
        id: "reward-1",
        name: "Free Drink",
        description: "Redeem for a free soft drink",
        points_required: 50,
        image: "/lovable-uploads/1ce327a1-4c4e-4a4f-9887-ca76023e50e9.png",
        active: true,
        created_at: new Date()
      },
      {
        id: "reward-2",
        name: "Free Hour of Play",
        description: "Redeem for a free hour on any gaming station",
        points_required: 100,
        image: "/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png",
        active: true,
        created_at: new Date()
      },
      {
        id: "reward-3",
        name: "₹200 Discount Voucher",
        description: "Get ₹200 off on your next visit",
        points_required: 200,
        active: true,
        created_at: new Date()
      }
    ]);

    // Load mock promotions
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    setPromotions([
      {
        id: "promo-1",
        name: "Weekend Special",
        description: "Get 10% off all gameplay sessions during weekends",
        discount_type: "percentage",
        discount_value: 10,
        code: "WEEKEND10",
        start_date: now,
        end_date: nextMonth,
        active: true,
        created_at: new Date()
      },
      {
        id: "promo-2",
        name: "Food & Beverage Combo",
        description: "Get ₹50 off when you buy any food and beverage combo",
        discount_type: "fixed",
        discount_value: 50,
        code: "COMBO50",
        start_date: now,
        end_date: nextMonth,
        active: true,
        created_at: new Date()
      }
    ]);

  }, []);

  // Set customers from pos customers
  useEffect(() => {
    setCustomers(posCustomers);
  }, [posCustomers]);

  // Filtered customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtered rewards based on search term
  const filteredRewards = rewards.filter(reward => 
    reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered promotions based on search term
  const filteredPromotions = promotions.filter(promotion => 
    promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add reward schema validation
  const rewardFormSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    points_required: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: "Points must be a positive number",
    }),
    image: z.string().optional(),
    active: z.boolean().default(true),
  });

  // Add promotion schema validation
  const promotionFormSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: "Discount value must be a positive number",
    }),
    code: z.string().min(4, "Code must be at least 4 characters"),
    start_date: z.string(),
    end_date: z.string(),
    active: z.boolean().default(true),
  });

  // Add reward form
  const rewardForm = useForm<z.infer<typeof rewardFormSchema>>({
    resolver: zodResolver(rewardFormSchema),
    defaultValues: {
      name: "",
      description: "",
      points_required: "",
      image: "",
      active: true,
    },
  });

  // Add promotion form
  const promotionForm = useForm<z.infer<typeof promotionFormSchema>>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      code: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true,
    },
  });

  // Handle adding a new reward
  const handleAddReward = (data: z.infer<typeof rewardFormSchema>) => {
    const newReward: Reward = {
      id: `reward-${Date.now()}`,
      name: data.name,
      description: data.description,
      points_required: parseInt(data.points_required),
      image: data.image,
      active: data.active,
      created_at: new Date(),
    };

    setRewards([...rewards, newReward]);
    
    toast({
      title: "Reward Added",
      description: "The reward has been successfully added",
    });
    
    rewardForm.reset();
  };

  // Handle adding a new promotion
  const handleAddPromotion = (data: z.infer<typeof promotionFormSchema>) => {
    const newPromotion: Promotion = {
      id: `promo-${Date.now()}`,
      name: data.name,
      description: data.description,
      discount_type: data.discount_type,
      discount_value: parseInt(data.discount_value),
      code: data.code,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      active: data.active,
      created_at: new Date(),
    };

    setPromotions([...promotions, newPromotion]);
    
    toast({
      title: "Promotion Added",
      description: "The promotion has been successfully added",
    });
    
    promotionForm.reset();
  };

  // Handle deleting a reward
  const handleDeleteReward = (id: string) => {
    setRewards(rewards.filter(reward => reward.id !== id));
    
    toast({
      title: "Reward Deleted",
      description: "The reward has been successfully deleted",
    });
  };

  // Handle deleting a promotion
  const handleDeletePromotion = (id: string) => {
    setPromotions(promotions.filter(promotion => promotion.id !== id));
    
    toast({
      title: "Promotion Deleted",
      description: "The promotion has been successfully deleted",
    });
  };

  // Handle manually adding loyalty points to a customer
  const handleAddLoyaltyPoints = (customerId: string, points: number) => {
    setCustomers(customers.map(customer => {
      if (customer.id === customerId) {
        return {
          ...customer,
          loyaltyPoints: (customer.loyaltyPoints || 0) + points
        };
      }
      return customer;
    }));
    
    toast({
      title: "Points Added",
      description: `${points} loyalty points added successfully`,
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Customer Portal Management</h1>
        <p className="text-muted-foreground">Manage customer accounts, rewards, and promotions</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, etc."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="customers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users size={16} />
            <span>Customers</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift size={16} />
            <span>Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex items-center gap-2">
            <Tag size={16} />
            <span>Promotions</span>
          </TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Accounts</CardTitle>
              <CardDescription>Manage customer account information and loyalty points</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>List of customer accounts</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Membership</TableHead>
                        <TableHead>Loyalty Points</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.email || '-'}</TableCell>
                          <TableCell>
                            {customer.isMember ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                None
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{customer.loyaltyPoints || 0}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Add Points</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Loyalty Points</DialogTitle>
                                  <DialogDescription>
                                    Add loyalty points to {customer.name}'s account.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex flex-col space-y-2">
                                    <Label htmlFor="points">Points</Label>
                                    <Input
                                      id="points"
                                      type="number"
                                      min="1"
                                      defaultValue="10"
                                    />
                                  </div>
                                  <div className="flex flex-col space-y-2">
                                    <Label htmlFor="reason">Reason</Label>
                                    <Input
                                      id="reason"
                                      placeholder="Special offer, compensation, etc."
                                      defaultValue="Admin adjustment"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={() => {
                                      const pointsInput = document.getElementById('points') as HTMLInputElement;
                                      const points = parseInt(pointsInput.value);
                                      if (!isNaN(points) && points > 0) {
                                        handleAddLoyaltyPoints(customer.id, points);
                                      }
                                    }}
                                  >
                                    Add Points
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <User className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No customers found</h3>
                  <p className="mt-1 text-muted-foreground">
                    No customers match your search criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Loyalty Rewards</CardTitle>
                <CardDescription>Manage rewards that customers can redeem with loyalty points</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus size={16} />
                    <span>Add Reward</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Reward</DialogTitle>
                    <DialogDescription>
                      Create a new reward that customers can redeem with loyalty points.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...rewardForm}>
                    <form onSubmit={rewardForm.handleSubmit(handleAddReward)} className="space-y-4">
                      <FormField
                        control={rewardForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reward Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Free Drink" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={rewardForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Redeem for a free soft drink"
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={rewardForm.control}
                        name="points_required"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points Required</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" placeholder="50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={rewardForm.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="/lovable-uploads/reward-image.png"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Leave blank to use default image
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={rewardForm.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>
                                Make this reward available to customers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Add Reward</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {filteredRewards.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>List of available rewards</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRewards.map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell className="font-medium">{reward.name}</TableCell>
                          <TableCell>{reward.description}</TableCell>
                          <TableCell>{reward.points_required}</TableCell>
                          <TableCell>
                            {reward.active ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                Inactive
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteReward(reward.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No rewards found</h3>
                  <p className="mt-1 text-muted-foreground">
                    No rewards match your search criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Promotions</CardTitle>
                <CardDescription>Manage promotional offers and discount codes</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus size={16} />
                    <span>Add Promotion</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Promotion</DialogTitle>
                    <DialogDescription>
                      Create a new promotional offer or discount code.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...promotionForm}>
                    <form onSubmit={promotionForm.handleSubmit(handleAddPromotion)} className="space-y-4">
                      <FormField
                        control={promotionForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promotion Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Weekend Special" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={promotionForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Get 10% off all gameplay sessions during weekends"
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={promotionForm.control}
                          name="discount_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage</SelectItem>
                                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={promotionForm.control}
                          name="discount_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Value</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="10"
                                    {...field}
                                    className={promotionForm.watch("discount_type") === "fixed" ? "pl-8" : ""}
                                  />
                                  {promotionForm.watch("discount_type") === "fixed" && (
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                  {promotionForm.watch("discount_type") === "percentage" && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                      <span className="text-muted-foreground">%</span>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={promotionForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promo Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="WEEKEND10"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={promotionForm.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="date"
                                    {...field}
                                  />
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={promotionForm.control}
                          name="end_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="date"
                                    {...field}
                                  />
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={promotionForm.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>
                                Make this promotion available to customers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Add Promotion</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {filteredPromotions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>List of active promotions</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Valid Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPromotions.map((promotion) => (
                        <TableRow key={promotion.id}>
                          <TableCell className="font-medium">{promotion.name}</TableCell>
                          <TableCell>
                            <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                              {promotion.code}
                            </span>
                          </TableCell>
                          <TableCell>
                            {promotion.discount_type === "percentage" ? (
                              <span>{promotion.discount_value}%</span>
                            ) : (
                              <span>₹{promotion.discount_value}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3" />
                              {new Date(promotion.start_date).toLocaleDateString()} - {new Date(promotion.end_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {promotion.active ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                Inactive
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePromotion(promotion.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No promotions found</h3>
                  <p className="mt-1 text-muted-foreground">
                    No promotions match your search criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerPortalManagement;
