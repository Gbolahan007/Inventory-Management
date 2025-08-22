"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "./supabase";
import { redirect } from "next/navigation";

// Define types for better type safety
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

export async function createProduct(formdata: FormData) {
  const name = formdata.get("name") as string;
  const cost_price = Number(formdata.get("cost_price"));
  const selling_price = Number(formdata.get("selling_price"));
  const current_stock = Number(formdata.get("current_stock"));
  const low_stock = Number(formdata.get("low_stock"));
  const category = formdata.get("category") as string;
  const profit = Number(formdata.get("profit"));
  try {
    // Check if product with this name already exists
    const { data: existingProduct, error: selectError } = await supabase
      .from("products")
      .select("current_stock")
      .eq("name", name)
      .maybeSingle();

    if (selectError) {
      console.error("Supabase select error:", selectError);
      throw new Error("Error checking existing product");
    }

    if (existingProduct) {
      // Product exists - update stock by adding new stock to existing
      const updatedStock = Number(
        existingProduct.current_stock + current_stock
      );

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

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw new Error("Product stock could not be updated");
      }
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
      console.log(newProduct);
      const { error: insertError } = await supabase
        .from("products")
        .insert(newProduct);

      if (insertError) {
        throw new Error("Product could not be created");
      }
    }

    revalidatePath("/dashboard/inventory");
    revalidatePath("/");
    redirect("/dashboard/inventory");
  } catch (error) {
    throw error;
  }
}

export async function createSale(saleData: SaleData) {
  const { data, error } = await supabase
    .from("sales")
    .insert(saleData)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Could not create sale");
  }
  return data;
}

export async function createSaleItems(saleItems: SaleItem[]) {
  const { data, error } = await supabase.from("sale_items").insert(saleItems);

  if (error) {
    console.error(error);
    throw new Error("Could not create sale items");
  }
  return data;
}

export async function updateProductStock(productId: string, newStock: number) {
  const { data, error } = await supabase
    .from("products")
    .update({ current_stock: newStock })
    .eq("id", productId);

  if (error) {
    console.error(error);
    throw new Error("Could not update product stock");
  }
  return data;
}

export async function addRoomBooking(formData: FormData) {
  const customerType = formData.get("customer_type") as string;
  const roomType = formData.get("room_type") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;

  console.log(formData);
  const { error } = await supabase.from("room_bookings").insert({
    customer_type: customerType,
    room_type: roomType,
    price,
    category,
  });

  if (error) throw new Error(error.message);

  return { success: true };
}
