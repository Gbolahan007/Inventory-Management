/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { supabase } from "./supabase";

// ---------- ERROR HANDLER ----------

const debugLog = (
  type: "info" | "error" | "warning" | "success",
  message: string,
  data?: any
) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;

  const styles = {
    info: "color: blue; font-weight: bold",
    error: "color: red; font-weight: bold",
    warning: "color: orange; font-weight: bold",
    success: "color: green; font-weight: bold",
  };

  console.log(`%c${logMessage}`, styles[type], data || "");

  try {
    const logs = JSON.parse(sessionStorage.getItem("debugLogs") || "[]");
    logs.push({ type, message, data, timestamp });
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    sessionStorage.setItem("debugLogs", JSON.stringify(logs));
  } catch {
    // ignore storage errors
  }
};

async function withClientErrorHandling<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  errorMessage: string,
  operationName: string = "Unknown Operation"
): Promise<T> {
  const startTime = Date.now();

  try {
    debugLog("info", `Starting ${operationName}`);

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError) {
      debugLog("error", `Auth error in ${operationName}`, authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!session) {
      debugLog("warning", `No session found for ${operationName}`);
      throw new Error("No active session - please log in again");
    }

    debugLog("success", `Valid session for ${operationName}`, {
      userId: session.user.id,
      expiresAt: session.expires_at,
    });

    const { data, error } = await operation();
    const duration = Date.now() - startTime;

    if (error) {
      debugLog("error", `${errorMessage} (${duration}ms)`, error);
      throw new Error(`${errorMessage}: ${error.message}`);
    }

    debugLog("success", `${operationName} succeeded (${duration}ms)`, {
      resultCount: Array.isArray(data) ? data.length : data ? 1 : 0,
    });

    return (data as T) ?? ([] as T);
  } catch (err: any) {
    const duration = Date.now() - startTime;
    debugLog("error", `${operationName} failed after ${duration}ms`, {
      message: err.message,
      stack: err.stack?.substring(0, 500),
    });
    throw err;
  }
}

// ---------- CLIENT-SIDE DATA FUNCTIONS ----------

export async function getProductsClient() {
  return withClientErrorHandling(
    async () => await supabase.from("products").select("*"),
    "Could not fetch products",
    "Get Products"
  );
}

export async function getDeleteProductsClient(id: number) {
  return withClientErrorHandling(
    async () => await supabase.from("products").delete().eq("id", id),
    "Products could not be deleted",
    `Delete Product ${id}`
  );
}

export async function getAllSalesClient() {
  return withClientErrorHandling(
    async () =>
      await supabase.from("sales").select("id, total_amount, sale_date"),
    "Could not fetch sales",
    "Get All Sales"
  );
}

export async function getTotalInventoryClient() {
  return withClientErrorHandling(
    async () =>
      await supabase
        .from("products")
        .select("current_stock, profit, low_stock, name"),
    "Inventory could not be loaded",
    "Get Total Inventory"
  );
}

export async function getTodaysSalesClient(start: Date, end: Date) {
  return withClientErrorHandling(
    async () =>
      await supabase
        .from("sales")
        .select("*")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString()),
    "Sales could not be loaded",
    `Get Today's Sales (${start.toDateString()} - ${end.toDateString()})`
  );
}

export async function getTodaysProfitClient(start: Date, end: Date) {
  return withClientErrorHandling(
    async () =>
      await supabase
        .from("sale_items")
        .select("profit_amount")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString()),
    "Profit data could not be loaded",
    `Get Today's Profit (${start.toDateString()} - ${end.toDateString()})`
  );
}

export async function getRecentSalesClient() {
  return withClientErrorHandling(
    async () => await supabase.from("sales").select("*"),
    "Sales could not be loaded",
    "Get Recent Sales"
  );
}

export async function getTopSellingProductsClient() {
  return withClientErrorHandling(
    async () =>
      await supabase.from("sale_items").select(`
        product_id,
        quantity,
        total_price,
        total_cost,
        sale_id,
        created_at,
        profit_amount,
        products (
          name,
          category
        )
      `),
    "Top selling products could not be loaded",
    "Get Top Selling Products"
  );
}

export async function getBarRequestsClient() {
  return withClientErrorHandling(
    async () => await supabase.from("bar_requests").select("*"),
    "Could not fetch bar requests",
    "Get Bar Requests"
  );
}

export async function createBarRequestsClient(barRequestItems: any[]) {
  return withClientErrorHandling(
    async () =>
      await supabase.from("bar_requests").insert(barRequestItems).select(),
    "Could not create bar requests",
    "Create Bar Requests"
  );
}

export async function getAllUsersClient() {
  return withClientErrorHandling(
    async () => await supabase.from("users").select("*"),
    "Users data could not be loaded",
    "Get All Users"
  );
}

export async function getSaleItemsWithCategoriesClient() {
  return withClientErrorHandling(
    async () =>
      await supabase.from("sale_items").select(`
        *,
        products!inner(
          name,
          category
        )
      `),
    "Could not fetch sale items with categories",
    "Get Sale Items With Categories"
  );
}

export async function getStatsClient() {
  try {
    const [salesResult, lowStockResult, productsResult] =
      await Promise.allSettled([
        supabase.from("sales").select("total_amount"),
        supabase.from("products").select("id").eq("low_stock", true),
        supabase.from("products").select("id, current_stock"),
      ]);

    const salesData =
      salesResult.status === "fulfilled" ? salesResult.value.data : [];
    const lowStockData =
      lowStockResult.status === "fulfilled" ? lowStockResult.value.data : [];
    const productsData =
      productsResult.status === "fulfilled" ? productsResult.value.data : [];

    const totalRevenue =
      salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

    return {
      totalSales: salesData?.length || 0,
      totalRevenue,
      lowStockItems: lowStockData?.length || 0,
      totalProducts:
        productsData?.filter((item) => item.current_stock !== 0).length || 0,
    };
  } catch {
    return {
      totalSales: 0,
      totalRevenue: 0,
      lowStockItems: 0,
      totalProducts: 0,
    };
  }
}

// ---------- SALES CREATION ----------

interface SaleItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  total_cost: number;
  selling_price: number;
  total_price: number;
  profit_amount: number;
}

interface SaleData {
  table_id: number;
  total_amount: number;
  payment_method: string;
  sales_rep_name: string;
  items: SaleItem[];
}

function generateSaleNumber(): number {
  const now = new Date();
  return Number(
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(
      now.getMinutes()
    ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}${String(
      now.getMilliseconds()
    ).padStart(3, "0")}`
  );
}

export async function createSalesClient(saleData: SaleData) {
  let saleId: string | null = null;

  try {
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        sale_number: generateSaleNumber(),
        total_amount: saleData.total_amount,
        payment_method: saleData.payment_method,
        sale_date: new Date().toISOString(),
        table_id: saleData.table_id,
        sales_rep_name: saleData.sales_rep_name,
      })
      .select()
      .single();

    if (saleError)
      throw new Error(`Could not create sale: ${saleError.message}`);
    saleId = sale.id;

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

    if (itemsError)
      throw new Error(`Could not create sale items: ${itemsError.message}`);

    // Update product stock
    await Promise.all(
      saleData.items.map(async (item) => {
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("current_stock")
          .eq("id", item.product_id)
          .single();
        if (fetchError) throw new Error(fetchError.message);

        const newStock = Math.max(0, product.current_stock - item.quantity);
        const { error: updateError } = await supabase
          .from("products")
          .update({ current_stock: newStock })
          .eq("id", item.product_id);
        if (updateError) throw new Error(updateError.message);
      })
    );

    return sale;
  } catch (error) {
    if (saleId) {
      try {
        await supabase.from("sales").delete().eq("id", saleId);
      } catch {
        // ignore rollback errors
      }
    }
    throw error;
  }
}
