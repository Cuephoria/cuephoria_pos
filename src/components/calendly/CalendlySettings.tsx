
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  apiToken: z.string().min(5, 'API token is required'),
  organizationUri: z.string().url('Must be a valid Calendly organization URI'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalendlySettingsProps {
  token: string;
  organizationUri: string;
  onSave: (token: string, organizationUri: string) => void;
}

const CalendlySettings: React.FC<CalendlySettingsProps> = ({
  token,
  organizationUri,
  onSave,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiToken: token || '',
      organizationUri: organizationUri || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      onSave(values.apiToken, values.organizationUri);
      
      toast({
        title: 'Settings saved',
        description: 'Your Calendly API settings have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: 'There was an error saving your Calendly API settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-gray-800 bg-[#1A1F2C] shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-cuephoria-purple" />
          <CardTitle>Calendly Integration</CardTitle>
        </div>
        <CardDescription>
          Configure your Calendly API credentials to connect with your calendar.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="apiToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calendly API Token</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your Calendly API token"
                      type="password"
                      {...field}
                      className="bg-gray-800 border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organizationUri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization URI</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.calendly.com/organizations/YOUR_ORG_ID"
                      {...field}
                      className="bg-gray-800 border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-sm text-gray-400">
              <p>To get your API token:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Log in to your Calendly account</li>
                <li>Go to Integrations &gt; API & Webhooks</li>
                <li>Generate a new Personal Access Token</li>
                <li>Copy your Organization URI from the API documentation</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-cuephoria-purple hover:bg-purple-600"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CalendlySettings;
