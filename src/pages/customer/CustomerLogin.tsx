
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CustomerLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cuephoria-dark p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Customer Login</CardTitle>
          <CardDescription>Sign in to access your customer portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full">Sign In</Button>
          <div className="text-center text-sm text-muted-foreground mt-2">
            Don't have an account?{" "}
            <Link to="/customer/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <Link to="/customer/reset-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomerLogin;
