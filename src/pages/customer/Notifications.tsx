
import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/customer/CustomerLayout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Bell,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Gift,
  Info,
  Mail,
  Megaphone,
  Clock,
  CalendarDays,
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'promo' | 'system' | 'reward';
  isRead: boolean;
  createdAt: Date;
}

const CustomerNotifications: React.FC = () => {
  const { user } = useCustomerAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    emailBookings: true,
    emailPromotions: true,
    emailSystem: true,
    pushBookings: true,
    pushPromotions: false,
    pushSystem: true,
  });

  // Mock data - would be fetched from backend in production
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // In production, this would fetch actual notifications from the database
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Booking Confirmation',
            message: 'Your booking for tomorrow at 2:00 PM is confirmed. We look forward to seeing you!',
            type: 'booking',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          },
          {
            id: '2',
            title: 'Special Weekend Offer',
            message: 'Get 20% off on all bookings this weekend! Use code WEEKEND20 at checkout.',
            type: 'promo',
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          },
          {
            id: '3',
            title: 'Loyalty Reward Available',
            message: 'You have earned a free 30-minute session! Redeem it on your next visit.',
            type: 'reward',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          },
          {
            id: '4',
            title: 'Membership Renewal',
            message: 'Your membership will expire in 7 days. Renew now to avoid interruption!',
            type: 'system',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
          },
          {
            id: '5',
            title: 'New Tournament Announced',
            message: 'Join our monthly tournament next week and win exciting prizes!',
            type: 'promo',
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
          },
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true } 
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'promo':
        return <Megaphone className="h-5 w-5 text-pink-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-amber-500" />;
      case 'reward':
        return <Gift className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
    
    // In production, this would update the user's preferences in the database
  };

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with bookings, promotions, and important announcements
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all" className="relative">
              All
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="booking">Bookings</TabsTrigger>
            <TabsTrigger value="promo">Promotions</TabsTrigger>
            <TabsTrigger value="reward">Rewards</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {loading ? (
              <Card>
                <CardContent className="flex justify-center py-10">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </CardContent>
              </Card>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={`overflow-hidden transition-colors ${!notification.isRead ? 'border-primary/30 bg-primary/5' : ''}`}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'booking' ? 'bg-blue-500/20' : 
                        notification.type === 'promo' ? 'bg-pink-500/20' :
                        notification.type === 'system' ? 'bg-amber-500/20' :
                        'bg-green-500/20'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-lg">{notification.title}</h3>
                          <Badge variant="outline" className="capitalize">
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-muted-foreground">
                            {notification.createdAt.toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {!notification.isRead && (
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No notifications</h3>
                  <p className="text-muted-foreground">
                    You're all caught up! We'll notify you when there's something new.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {['booking', 'promo', 'reward', 'system'].map((type) => (
            <TabsContent key={type} value={type} className="mt-6">
              {loading ? (
                <Card>
                  <CardContent className="flex justify-center py-10">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </CardContent>
                </Card>
              ) : notifications.filter(n => n.type === type).length > 0 ? (
                <div className="space-y-4">
                  {notifications
                    .filter(notification => notification.type === type)
                    .map((notification) => (
                      <Card key={notification.id} className={`overflow-hidden transition-colors ${!notification.isRead ? 'border-primary/30 bg-primary/5' : ''}`}>
                        <CardContent className="p-4 flex items-start gap-4">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'booking' ? 'bg-blue-500/20' : 
                            notification.type === 'promo' ? 'bg-pink-500/20' :
                            notification.type === 'system' ? 'bg-amber-500/20' :
                            'bg-green-500/20'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-lg">{notification.title}</h3>
                              <Badge variant="outline" className="capitalize">
                                {notification.type}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">{notification.message}</p>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs text-muted-foreground">
                                {notification.createdAt.toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {!notification.isRead && (
                                <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                                  Mark as read
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No {type} notifications</h3>
                    <p className="text-muted-foreground">
                      You're all caught up! We'll notify you when there's something new.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Customize how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-medium mb-3">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </h3>
                <div className="space-y-4 pl-7">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-bookings" className="flex-1">
                      <span className="font-medium">Booking Updates</span>
                      <span className="block text-sm text-muted-foreground">
                        Confirmations, reminders, and changes
                      </span>
                    </Label>
                    <Switch
                      id="email-bookings"
                      checked={preferences.emailBookings}
                      onCheckedChange={() => handlePreferenceChange('emailBookings')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-promotions" className="flex-1">
                      <span className="font-medium">Promotions & Offers</span>
                      <span className="block text-sm text-muted-foreground">
                        Special deals, events, and new services
                      </span>
                    </Label>
                    <Switch
                      id="email-promotions"
                      checked={preferences.emailPromotions}
                      onCheckedChange={() => handlePreferenceChange('emailPromotions')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-system" className="flex-1">
                      <span className="font-medium">System Updates</span>
                      <span className="block text-sm text-muted-foreground">
                        Membership status, loyalty points, and account changes
                      </span>
                    </Label>
                    <Switch
                      id="email-system"
                      checked={preferences.emailSystem}
                      onCheckedChange={() => handlePreferenceChange('emailSystem')}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="flex items-center gap-2 text-lg font-medium mb-3">
                  <Bell className="h-5 w-5" />
                  Push Notifications
                </h3>
                <div className="space-y-4 pl-7">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-bookings" className="flex-1">
                      <span className="font-medium">Booking Updates</span>
                      <span className="block text-sm text-muted-foreground">
                        Confirmations, reminders, and changes
                      </span>
                    </Label>
                    <Switch
                      id="push-bookings"
                      checked={preferences.pushBookings}
                      onCheckedChange={() => handlePreferenceChange('pushBookings')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-promotions" className="flex-1">
                      <span className="font-medium">Promotions & Offers</span>
                      <span className="block text-sm text-muted-foreground">
                        Special deals, events, and new services
                      </span>
                    </Label>
                    <Switch
                      id="push-promotions"
                      checked={preferences.pushPromotions}
                      onCheckedChange={() => handlePreferenceChange('pushPromotions')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-system" className="flex-1">
                      <span className="font-medium">System Updates</span>
                      <span className="block text-sm text-muted-foreground">
                        Membership status, loyalty points, and account changes
                      </span>
                    </Label>
                    <Switch
                      id="push-system"
                      checked={preferences.pushSystem}
                      onCheckedChange={() => handlePreferenceChange('pushSystem')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default CustomerNotifications;
