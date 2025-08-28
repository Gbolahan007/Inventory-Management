"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BarRequest } from "../dashboard/sales/(sales)/types";
import { supabaseServer } from "@/app/_lib/supabaseServer"; // ✅ point to actual helper file

// ---------------- TYPES ----------------
interface SaleData {
  sale_number: string;
  total_amount: number;
  payment_method: string;
  sale_date: string;
}

interface SaleItem {
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
}

export interface BarRequestItem {
  table_id: number;
  product_id: string;
  product_name: string;
  quantity: number;
  sales_rep_id: string;
  sales_rep_name: string;
  status: "completed";
}

// ---------------- PRODUCT ACTIONS ----------------

export async function createProduct(formdata: FormData) {
  const supabase = await supabaseServer();

  const name = formdata.get("name") as string;
  const cost_price = Number(formdata.get("cost_price"));
  const selling_price = Number(formdata.get("selling_price"));
  const current_stock = Number(formdata.get("current_stock"));
  const low_stock = Number(formdata.get("low_stock"));
  const category = formdata.get("category") as string;
  const profit = Number(formdata.get("profit"));

  const { data: existingProduct, error: selectError } = await supabase
    .from("products")
    .select("current_stock")
    .eq("name", name)
    .maybeSingle();

  if (selectError) throw new Error("Error checking existing product");

  if (existingProduct) {
    const updatedStock = existingProduct.current_stock + current_stock;
    const { error: updateError } = await supabase
      .from("products")
      .update({
        current_stock: updatedStock,
        cost_price,
        selling_price,
        low_stock,
        category,
        profit,
        created_at: new Date().toISOString(),
      })
      .eq("name", name);
    if (updateError) throw new Error("Product stock could not be updated");
  } else {
    const newProduct = {
      name,
      cost_price,
      selling_price,
      current_stock,
      low_stock,
      category,
      profit,
      quantity: 1,
      created_at: new Date().toISOString(),
    };
    const { error: insertError } = await supabase
      .from("products")
      .insert(newProduct);
    if (insertError) throw new Error("Product could not be created");
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/");
  redirect("/dashboard/inventory");
}

export async function updateProductStock(productId: string, newStock: number) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("products")
    .update({ current_stock: newStock })
    .eq("id", productId);
  if (error) throw new Error("Could not update product stock");
  return data;
}

// ---------------- SALES ACTIONS ----------------

export async function createSale(saleData: SaleData) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("sales")
    .insert(saleData)
    .select()
    .single();
  if (error) throw new Error("Could not create sale");
  return data;
}

export async function createSaleItems(saleItems: SaleItem[]) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("sale_items").insert(saleItems);
  if (error) throw new Error("Could not create sale items");
  return data;
}

// ---------------- ROOM BOOKING ----------------

export async function addRoomBooking(formData: FormData) {
  const supabase = await supabaseServer();
  const customerType = formData.get("customer_type") as string;
  const roomType = formData.get("room_type") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;

  const { error } = await supabase.from("room_bookings").insert({
    customer_type: customerType,
    room_type: roomType,
    price,
    category,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

// ---------------- BAR REQUESTS ----------------

export async function createBarRequestRecords(
  barRequestItems: Omit<BarRequest, "id">[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("bar_requests")
    .insert(barRequestItems)
    .select();
  if (error) {
    return {
      success: false,
      error: `Failed to create bar request records: ${error.message}`,
    };
  }
  return { success: true };
}

export async function updateBarRequestStatus(
  requestId: string,
  newStatus: "given" | "cancelled" | "completed"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("bar_requests")
    .update({ status: newStatus })
    .eq("id", requestId);
  if (error)
    return {
      success: false,
      error: `Failed to update status: ${error.message}`,
    };
  return { success: true };
}

export async function updateMultipleBarRequestsStatus(
  requestIds: string[],
  newStatus: "given" | "cancelled" | "completed"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("bar_requests")
    .update({ status: newStatus })
    .in("id", requestIds);
  if (error)
    return {
      success: false,
      error: `Failed to update statuses: ${error.message}`,
    };
  return { success: true };
}
