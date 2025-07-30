export type Product = {
  id: string;
  name: string;
  category?: string;
  cost_price: number;
  selling_price: number;
  profit_margin?: number;
  current_stock: number;
  minimum_stock?: number;
  low_stock?: boolean;
  profit?: number;
  is_active?: boolean;
};

export type Sale = {
  id: string;
  sale_number?: string;
  total_amount: number;
  payment_method?: string;
  sale_date: string;
  created_at?: string;
  quantity_sold?: number;
  total_revenue?: number;
  profits?: number;
  total_cost?: number;
  inventory?: {
    id: string;
    subcategories: {
      name: string;
      categories: {
        name: string;
      };
    };
  };
};

export type SaleItem = {
  id?: string;
  sale_id?: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  products?: {
    name: string;
  };
};

export type Stats = {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockItems: number;
};
