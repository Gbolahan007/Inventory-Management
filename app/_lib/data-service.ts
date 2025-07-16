import { supabase } from "@/app/_lib/supabase";

// Define the shape of the returned data
type Sale = {
  id: string;
  quantity_sold: number;
  total_revenue: number;
  profits: number;
  total_cost: number;
  created_at: string;
  inventory: {
    id: string;
    subcategories: {
      name: string;
      categories: {
        name: string;
      };
    };
  };
};
interface SaleData {
  total_amount: number;
  payment_method: string;
  items: SaleItem[];
}

export async function getProducts() {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    console.error(error);
    throw new Error("Could not fetch products");
  }

  return data ?? [];
}

export async function getAllSales() {
  const { data, error } = await supabase
    .from("sales")
    .select("id, total_amount, sale_date");

  if (error) {
    console.error(error);
    throw new Error("Could not fetch sales");
  }

  return data ?? [];
}

export async function getTodaysSales(start: Date, end: Date): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  if (error) {
    console.error(error);
    throw new Error("Sales could not be loaded");
  }
  return data as Sale[];
}
export async function getRecentSales() {
  const { data, error } = await supabase.from("sales").select("*");

  if (error) {
    console.error(error);
    throw new Error("Sales could not be loaded");
  }
  return data as Sale[];
}

export async function getTotalInventory() {
  const { data, error } = await supabase
    .from("products")
    .select("current_stock, profit,low_stock,name");

  if (error) {
    console.error(error);
    throw new Error("Sales could not be loaded");
  }
  return data;
}

export async function getTopsellingProducts() {
  const { data, error } = await supabase
    .from("sale_items")
    .select("product_id, quantity, total_price, products(name)");

  if (error) {
    console.error(error);
    throw new Error("Sales could not be loaded");
  }
  return data;
}

export async function getStats() {
  // Get total sales and revenue
  const { data: salesData } = await supabase
    .from("sales")
    .select("total_amount");

  // Get low stock items
  const { data: lowStockData } = await supabase
    .from("products")
    .select("id")
    .eq("low_stock", true);

  // Get total products
  const { data: productsData } = await supabase.from("products").select("id");

  const totalRevenue =
    salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

  return {
    totalSales: salesData?.length || 0,
    totalRevenue,
    lowStockItems: lowStockData?.length || 0,
    totalProducts: productsData?.length || 0,
  };
}
// Function to generate sale number
function generateSaleNumber(): number {
  const now = new Date();
  const year = now.getFullYear(); // e.g. 2025
  const month = String(now.getMonth() + 1).padStart(2, "0"); // e.g. "07"
  const day = String(now.getDate()).padStart(2, "0"); // e.g. "14"
  const time = now.getTime().toString().slice(-6); // e.g. "123456"

  // Combine to form something like 20250714123456
  const saleNumberStr = `${year}${month}${day}${time}`;

  return Number(saleNumberStr); // Convert to number
}

// Function to create a complete sale with items and update stock
export async function createSales(saleData: SaleData) {
  // Start a transaction-like approach
  try {
    // Step 1: Create the main sale record
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        sale_number: generateSaleNumber(),
        total_amount: saleData.total_amount,
        payment_method: saleData.payment_method,
        sale_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (saleError) {
      console.error("Sale creation error:", saleError);
      throw new Error("Could not create sale");
    }

    // Step 2: Create sale items with the sale_id
    const saleItemsToInsert = saleData.items.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit_cost: item.unit_cost,
      total_price: item.total_price,
      total_cost: item.total_cost,
      profit_amount: item.profit_amount,
    }));

    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(saleItemsToInsert);

    if (itemsError) {
      console.error("Sale items creation error:", itemsError);
      // Rollback: Delete the sale record if items creation fails
      await supabase.from("sales").delete().eq("id", sale.id);
      throw new Error("Could not create sale items");
    }

    // Step 3: Update product stock for each item
    const stockUpdatePromises = saleData.items.map(async (item) => {
      // First, get current stock
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("current_stock")
        .eq("id", item.product_id)
        .single();

      if (fetchError) {
        console.error("Error fetching product stock:", fetchError);
        throw new Error(`Could not fetch stock for product ${item.product_id}`);
      }

      // Calculate new stock
      const newStock = product.current_stock - item.quantity;

      // Update the stock
      const { error: updateError } = await supabase
        .from("products")
        .update({
          current_stock: newStock,
        })
        .eq("id", item.product_id);

      if (updateError) {
        console.error("Error updating product stock:", updateError);
        throw new Error(
          `Could not update stock for product ${item.product_id}`
        );
      }

      return { product_id: item.product_id, new_stock: newStock };
    });

    // Wait for all stock updates to complete
    await Promise.all(stockUpdatePromises);

    return sale;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}
