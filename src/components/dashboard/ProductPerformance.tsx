
import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Package } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { Bill } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductPerformanceProps {
  filteredBills?: Bill[];
}

const ProductPerformance: React.FC<ProductPerformanceProps> = ({ filteredBills }) => {
  const { products, bills: allBills } = usePOS();
  
  // Use filtered bills if provided, otherwise use all bills
  const bills = filteredBills || allBills;
  
  // State for sorting and filtering
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity' | 'profit'>('revenue');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  
  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [products]);
  
  // Calculate product performance data
  const productPerformanceData = useMemo(() => {
    // Create a map to store product performance metrics
    const productMap = new Map();
    
    // Initialize with all products
    products.forEach(product => {
      productMap.set(product.id, {
        id: product.id,
        name: product.name,
        category: product.category || 'Uncategorized',
        stock: product.stock,
        cost: product.originalPrice || 0, // Use originalPrice instead of cost
        price: product.price,
        quantity: 0,
        revenue: 0,
        profit: 0
      });
    });
    
    // Process all bills to get sales data
    bills.forEach(bill => {
      // Calculate discount ratio for proportional application
      const discountRatio = bill.subtotal > 0 ? bill.total / bill.subtotal : 1;
      
      bill.items.forEach(item => {
        if (item.type !== 'product' || !productMap.has(item.id)) return;
        
        const product = productMap.get(item.id);
        
        // Apply proportional discount to the item
        const discountedItemTotal = item.total * discountRatio;
        
        // Update product metrics
        product.quantity += item.quantity;
        product.revenue += discountedItemTotal;
        
        // Calculate profit (revenue - cost)
        product.profit += discountedItemTotal - (product.cost * item.quantity);
      });
    });
    
    // Convert map to array and sort by specified criteria
    const result = Array.from(productMap.values())
      // Filter by search term if provided
      .filter(product => {
        const searchLower = search.toLowerCase();
        return product.name.toLowerCase().includes(searchLower) ||
               product.category.toLowerCase().includes(searchLower);
      })
      // Filter by category if selected
      .filter(product => !categoryFilter || product.category === categoryFilter)
      // Only include products that have been sold
      .filter(product => product.quantity > 0);
    
    // Sort the data
    if (sortBy === 'revenue') {
      result.sort((a, b) => b.revenue - a.revenue);
    } else if (sortBy === 'quantity') {
      result.sort((a, b) => b.quantity - a.quantity);
    } else if (sortBy === 'profit') {
      result.sort((a, b) => b.profit - a.profit);
    }
    
    return result;
  }, [products, bills, sortBy, search, categoryFilter]);
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Product Performance</CardTitle>
            <CardDescription className="text-gray-400">Sales and performance metrics by product</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#EC4899]/20 flex items-center justify-center">
            <Package className="h-5 w-5 text-[#EC4899]" />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:flex sm:items-center sm:justify-between">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Sort by Revenue</SelectItem>
                <SelectItem value="quantity">Sort by Quantity</SelectItem>
                <SelectItem value="profit">Sort by Profit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productPerformanceData.length > 0 ? (
              productPerformanceData.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay amount={product.revenue} />
                  </TableCell>
                  <TableCell className={`text-right ${product.profit < 0 ? 'text-red-500' : ''}`}>
                    <CurrencyDisplay amount={product.profit} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={product.stock <= 5 ? 'text-orange-500' : ''}>
                      {product.stock}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductPerformance;
