"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "./supabase";
import { redirect } from "next/navigation";

export async function createProduct(formdata) {
  const name = formdata.get("name");
  const cost_price = Number(formdata.get("cost_price"));
  const selling_price = Number(formdata.get("selling_price"));
  const current_stock = Number(formdata.get("current_stock"));
  const low_stock = Number(formdata.get("low_stock"));
  const category = formdata.get("category");
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
      };

      const { error: insertError } = await supabase
        .from("products")
        .insert(newProduct);

      if (insertError) {
        throw new Error("Product could not be created");
      }
    }

    revalidatePath("/inventory");
    revalidatePath("/");
    redirect("/inventory");
  } catch (error) {
    throw error;
  }
}

export async function createSale(saleData: {
  sale_number: string;
  total_amount: number;
  payment_method: string;
  sale_date: string;
}) {
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

export async function createSaleItems(saleItems: any[]) {
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
