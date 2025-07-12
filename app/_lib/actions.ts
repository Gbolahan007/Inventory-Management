"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "./supabase";

export async function createProduct(formdata) {
  const name = formdata.get("name");
  const cost_price = Number(formdata.get("cost_price"));
  const selling_price = Number(formdata.get("selling_price"));
  const current_stock = String(formdata.get("current_stock"));
  const low_stock = Number(formdata.get("low_stock"));
  const category = formdata.get("category");
  const profit = Number(formdata.get("profit"));

  const updateproduct = {
    name,
    cost_price,
    selling_price,
    current_stock,
    low_stock,
    category,
    profit,
    quantity: 1,
  };
  const { error } = await supabase.from("products").insert(updateproduct);

  if (error) {
    console.error("Supabase insert error:", error);

    throw new Error("Product could not be created");
  }

  revalidatePath(`/inventory`);
}
