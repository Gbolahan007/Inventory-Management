/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useTableCartStore } from "@/app/(store)/useTableCartStore";
import { useCreateSale } from "@/app/components/queryhooks/useCreateSale";
import toast from "react-hot-toast";
import type { Product } from "../(sales)/types";
import { supabase } from "@/app/_lib/supabase";

interface UseTableCartLogicProps {
  products?: Product[];
  currentUser?: { name: string };
  currentUserId?: string;
}

export function useTableCartLogic({
  products,
  currentUser,
  currentUserId,
}: UseTableCartLogicProps) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customSellingPrice, setCustomSellingPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("transfer");

  const createSaleMutation = useCreateSale();

  const {
    selectedTable,
    setCurrentUser,
    addToTableCart,
    removeFromTableCart,
    updateTableCartItemQuantity,
    clearTableCart,
    getTableCart,
    getTableTotal,
    getTableTotalCost,
    getTableTotalProfit,
  } = useTableCartStore();

  const currentCart = getTableCart(selectedTable);
  const currentTotal = getTableTotal(selectedTable);
  const currentTotalCost = getTableTotalCost(selectedTable);
  const currentTotalProfit = getTableTotalProfit(selectedTable);

  // Initialize user
  useEffect(() => {
    if (currentUserId) {
      setCurrentUser(currentUserId);
    }
  }, [currentUserId, setCurrentUser]);

  // Add to cart (in-memory only)
  const handleAddToCart = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error("Please select a product and enter a valid quantity");
      return;
    }

    const selectedProductData = products?.find(
      (p) => p.name === selectedProduct
    );
    if (!selectedProductData) {
      toast.error("Product not found");
      return;
    }

    // Stock check
    const existingCartQuantity = currentCart
      .filter((item) => item.product_id === selectedProductData.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (existingCartQuantity + quantity > selectedProductData.current_stock) {
      toast.error("Not enough stock available");
      return;
    }

    const unitPrice =
      customSellingPrice || selectedProductData.selling_price || 0;
    const unitCost = selectedProductData.cost_price || 0;
    const totalPrice = unitPrice * quantity;
    const profitAmount = totalPrice - unitCost * quantity;

    // Create item for cart
    const newItem = {
      product_id: selectedProductData.id,
      name: selectedProductData.name,
      quantity: quantity,
      unit_price: unitPrice,
      unit_cost: unitCost,
      total_price: totalPrice,
      total_cost: unitCost * quantity,
      profit_amount: profitAmount,
      selling_price: unitPrice,
      sales_rep_name: currentUser?.name || "",
    };

    try {
      addToTableCart(selectedTable, newItem);
      toast.success(`${newItem.name} added to cart!`);

      // Reset form
      setSelectedProduct("");
      setQuantity(1);
      setCustomSellingPrice(0);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(`Failed to add item: ${error.message}`);
    }
  };

  // Complete sale directly (no bar approval needed)
  const handleFinalizeSale = async () => {
    if (currentCart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!currentUser || !currentUserId) {
      toast.error("User information not available");
      return;
    }

    try {
      // Prepare sale data
      const saleData = {
        total_amount: currentTotal,
        payment_method: paymentMethod,
        items: currentCart,
        table_id: selectedTable,
        sales_rep_id: currentUserId,
        sales_rep_name: currentUser.name,
      };

      // Create sale record
      await createSaleMutation.mutateAsync(saleData);

      // Also create bar_requests record for inventory tracking
      const barRequestItems = currentCart.map((item) => ({
        table_id: selectedTable,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        sales_rep_id: currentUserId,
        sales_rep_name: currentUser.name,
        status: "completed", // Immediately mark as completed since no approval needed
      }));

      // Insert bar request records for tracking
      const { error: barRequestError } = await supabase
        .from("bar_requests")
        .insert(barRequestItems);

      if (barRequestError) {
        console.error("Error creating bar request records:", barRequestError);
        // Don't throw error - sale is already completed
      }

      // Clear cart
      clearTableCart(selectedTable);
      toast.success(`Sale completed for Table ${selectedTable}!`);
    } catch (error: any) {
      console.error("Error finalizing sale:", error);
      toast.error(`Failed to complete sale: ${error.message}`);
    }
  };

  // Remove from cart
  const removeFromCart = (productId: string, unitPrice: number) => {
    try {
      removeFromTableCart(selectedTable, productId, unitPrice);
      toast.success("Item removed from cart");
    } catch (error: any) {
      toast.error(`Failed to remove item: ${error.message}`);
    }
  };

  // Update cart item quantity
  const updateCartItemQuantity = (
    productId: string,
    unitPrice: number,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, unitPrice);
      return;
    }

    const product = products?.find((p) => p.id === productId);
    if (product) {
      const otherItemsQuantity = currentCart
        .filter(
          (cartItem) =>
            !(
              cartItem.product_id === productId &&
              cartItem.unit_price === unitPrice
            )
        )
        .filter((cartItem) => cartItem.product_id === product.id)
        .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      if (otherItemsQuantity + newQuantity > product.current_stock) {
        toast.error("Not enough stock available");
        return;
      }
    }

    try {
      updateTableCartItemQuantity(
        selectedTable,
        productId,
        unitPrice,
        newQuantity
      );
    } catch (error: any) {
      toast.error(`Failed to update quantity: ${error.message}`);
    }
  };

  // Helper calculations
  const selectedProductData = products?.find(
    (product) => product.name === selectedProduct
  );
  const unitPrice =
    customSellingPrice || selectedProductData?.selling_price || 0;
  const totalPrice = unitPrice * quantity;

  const canFinalizeSale = currentCart.length > 0;

  // Event handlers
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productName = e.target.value;
    setSelectedProduct(productName);
    if (productName) {
      const product = products?.find((p) => p.name === productName);
      setCustomSellingPrice(product?.selling_price || 0);
    } else {
      setCustomSellingPrice(0);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setQuantity(0);
      return;
    }
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantity(numValue);
    }
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSellingPrice(Number(e.target.value));
  };

  return {
    selectedProduct,
    quantity,
    customSellingPrice,
    paymentMethod,
    selectedProductData,
    currentCart,
    currentTotal,
    currentTotalCost,
    currentTotalProfit,
    unitPrice,
    totalPrice,
    canFinalizeSale,
    setSelectedProduct,
    setQuantity,
    setCustomSellingPrice,
    setPaymentMethod,
    handleProductChange,
    handleQuantityChange,
    handleSellingPriceChange,
    handleAddToCart,
    removeFromCart,
    updateCartItemQuantity,
    handleFinalizeSale,
    createSaleMutation,
    // Legacy props for compatibility (no longer used)
    tableBarRequestStatus: "none" as const,
    hasPendingItems: false,
    approvedItems: currentCart,
    pendingItems: [],
    approvedTotal: currentTotal,
    pendingTotal: 0,
    handleSendToBar: () => {}, // No-op since no bar approval needed
    isSendingToBar: false,
  };
}
