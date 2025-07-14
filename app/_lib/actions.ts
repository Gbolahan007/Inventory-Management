"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "./supabase";
import { redirect } from "next/navigation";

export async function createProduct(formdata) {
  const name = formdata.get("name");
  const cost_price = Number(formdata.get("cost_price"));
  const selling_price = Number(formdata.get("selling_price"));
  const current_stock = Number(formdata.get("current_stock")); // Changed to Number
  const low_stock = Number(formdata.get("low_stock"));
  const category = formdata.get("category");
  const profit = Number(formdata.get("profit"));
  console.log(current_stock);

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
      console.log(updatedStock);

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

      console.log(
        `Product "${name}" stock updated. New stock: ${updatedStock}`
      );
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
