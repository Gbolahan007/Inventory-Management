/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useTableCartStore } from "@/app/(store)/useTableCartStore";
import { useCreateSale } from "@/app/components/queryhooks/useCreateSale";
import { useCreateBarRequest } from "@/app/components/queryhooks/useBarRequests";
import toast from "react-hot-toast";
import type { SaleItem, BarRequest, Product } from "../(sales)/types";

interface UseTableCartLogicProps {
  products?: Product[];
  currentUser?: {
    name: string;
  };
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
  const createBarRequestMutation = useCreateBarRequest();

  const {
    selectedTable,
    addToTableCart,
    removeFromTableCart,
    updateTableCartItemQuantity,
    clearTableCart,
    getTableCart,
    getTableTotal,
    setTableBarRequestStatus,
    getTableBarRequestStatus,
    // New methods needed for tracking approved vs pending items
    getTableApprovedCart,
    getTablePendingCart,
    moveSpecificItemsToApproved,
    moveItemsToApproved,
  } = useTableCartStore();

  const currentCart = getTableCart(selectedTable);
  const currentTotal = getTableTotal(selectedTable);
  const tableBarRequestStatus = getTableBarRequestStatus(selectedTable);

  // Split cart into approved and pending items
  const approvedItems = getTableApprovedCart?.(selectedTable) || [];
  const pendingItems = getTablePendingCart?.(selectedTable) || [];

  // Calculate totals for different item states
  const approvedTotal = approvedItems.reduce(
    (sum, item) => sum + item.total_price,
    0
  );
  const pendingTotal = pendingItems.reduce(
    (sum, item) => sum + item.total_price,
    0
  );
  const currentTotalProfit = currentCart.reduce(
    (sum, item) => sum + item.profit_amount,
    0
  );

  // Find the selected product
  const selectedProductData = products?.find(
    (product) => product.name === selectedProduct
  );

  // Calculate prices
  const unitPrice =
    customSellingPrice || selectedProductData?.selling_price || 0;
  const unitCost = selectedProductData?.cost_price || 0;
  const totalPrice = unitPrice * quantity;
  const profitAmount = totalPrice - unitCost * quantity;

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

  // Enhanced add to cart logic
  const handleAddToCart = () => {
    if (!selectedProductData || quantity <= 0) {
      toast.error("Please select a product and enter a valid quantity");
      return;
    }

    if (tableBarRequestStatus === "pending") {
      toast.error(
        "Cannot add items while bar request is pending. Wait for bartender to fulfill the order."
      );
      return;
    }

    // Check stock availability
    const existingCartQuantity = currentCart
      .filter((item) => item.product_id === selectedProductData.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (existingCartQuantity + quantity > selectedProductData.current_stock) {
      toast.error("Not enough stock available");
      return;
    }

    const newItem: SaleItem = {
      product_id: selectedProductData.id,
      name: selectedProductData.name,
      quantity: quantity,
      unit_price: unitPrice,
      unit_cost: unitCost,
      total_price: totalPrice,
      total_cost: unitCost * quantity,
      profit_amount: profitAmount,
      selling_price: unitPrice,
      approval_status: "pending",
    };

    addToTableCart(selectedTable, newItem);

    // If there are already approved items, show different message
    if (tableBarRequestStatus === "given") {
      toast.success(
        `${newItem.name} added to Table ${selectedTable} cart! This item needs bar approval before finalizing sale.`
      );
    } else {
      toast.success(`${newItem.name} added to Table ${selectedTable} cart!`);
    }

    // Reset form
    setSelectedProduct("");
    setQuantity(1);
    setCustomSellingPrice(0);
  };

  // Remove item from cart
  const removeFromCart = (productId: string, unitPrice: number) => {
    if (tableBarRequestStatus === "pending") {
      toast.error("Cannot modify cart while bar request is pending.");
      return;
    }

    removeFromTableCart(selectedTable, productId, unitPrice);
    toast.success("Item removed from cart");
  };

  // Update cart item quantity
  const updateCartItemQuantity = (
    productId: string,
    unitPrice: number,
    newQuantity: number
  ) => {
    if (tableBarRequestStatus === "pending") {
      toast.error("Cannot modify cart while bar request is pending.");
      return;
    }

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

    updateTableCartItemQuantity(
      selectedTable,
      productId,
      unitPrice,
      newQuantity
    );
  };

  // Enhanced send to bar logic
  const handleSendToBar = async () => {
    // Get only pending items for bar request
    const pendingItemsToSend = currentCart.filter(
      (item) => !item.approval_status || item.approval_status === "pending"
    );

    if (pendingItemsToSend.length === 0) {
      toast.error("No pending items to send to bar");
      return;
    }

    if (!currentUser) {
      toast.error("User information not available");
      return;
    }

    try {
      const barRequestItems: Omit<BarRequest, "id">[] = pendingItemsToSend.map(
        (item) => ({
          table_id: selectedTable,
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          sales_rep_id: currentUserId!,
          sales_rep_name: currentUser.name,
          status: "pending",
        })
      );

      createBarRequestMutation.mutate(barRequestItems, {
        onSuccess: () => {
          toast.success(
            `Bar request sent for ${pendingItemsToSend.length} item(s) on Table ${selectedTable}!`
          );
          setTableBarRequestStatus(selectedTable, "pending");
        },
        onError: () => {
          toast.error("Failed to send bar request");
        },
      });
    } catch {
      toast.error("Failed to send bar request");
    }
  };

  // Enhanced finalize sale logic
  const handleFinalizeSale = async () => {
    if (currentCart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Check if there are any pending items
    const hasPendingItems = currentCart.some(
      (item) => !item.approval_status || item.approval_status === "pending"
    );

    if (hasPendingItems) {
      toast.error(
        "Cannot finalize sale. Some items are still pending bar approval. Please send them to bar first."
      );
      return;
    }

    if (tableBarRequestStatus === "pending") {
      toast.error(
        "Cannot finalize sale while bar request is pending. Wait for bartender to fulfill the order."
      );
      return;
    }

    // Only allow finalization if all items are approved
    const allItemsApproved = currentCart.every(
      (item) => item.approval_status === "approved"
    );

    if (!allItemsApproved) {
      toast.error("All items must be approved by bar before finalizing sale.");
      return;
    }

    if (!currentUser) {
      toast.error("User information not available");
      return;
    }

    try {
      const saleData = {
        total_amount: currentTotal,
        payment_method: paymentMethod,
        items: currentCart,
        table_id: selectedTable,
        sales_rep_id: currentUserId,
        sales_rep_name: currentUser.name,
      };

      // Reset mutation status before making the call
      createSaleMutation.reset();

      await createSaleMutation
        .mutateAsync(saleData)
        .then(() => {
          // Clear the cart
          clearTableCart(selectedTable);

          // Reset bar request status
          setTableBarRequestStatus(selectedTable, "none");

          toast.success(`Sale completed for Table ${selectedTable}!`);
        })
        .catch((error: any) => {
          toast.error(
            `Failed to complete sale: ${error?.message || "Unknown error"}`
          );
        });
    } catch {
      toast.error("Failed to complete sale");
    }
  };

  // New method to handle bar approval confirmation for specific items
  const handleBarApprovalReceived = (
    approvedBarRequestItems?: BarRequest[]
  ) => {
    if (!approvedBarRequestItems || approvedBarRequestItems.length === 0) {
      // Fallback: approve all pending items (for backward compatibility)
      if (moveItemsToApproved) {
        moveItemsToApproved(selectedTable);
      }
    } else {
      // Approve only the specific confirmed items
      if (moveSpecificItemsToApproved) {
        const itemsToApprove = approvedBarRequestItems.map((barItem) => ({
          product_id: barItem.product_id,
          quantity: barItem.quantity,
        }));

        moveSpecificItemsToApproved(selectedTable, itemsToApprove);
      }
    }

    // Update table status based on current cart state
    const updatedCart = getTableCart(selectedTable);
    const stillHasPendingItems = updatedCart.some(
      (item) => !item.approval_status || item.approval_status === "pending"
    );

    if (!stillHasPendingItems && updatedCart.length > 0) {
      // All items are approved
      setTableBarRequestStatus(selectedTable, "given");
    } else if (stillHasPendingItems) {
      // Still have pending items, reset to allow new bar requests
      setTableBarRequestStatus(selectedTable, "none");
    }
  };

  // Check if there are pending items that need bar approval
  const hasPendingItems = currentCart.some(
    (item) => !item.approval_status || item.approval_status === "pending"
  );

  // Check if sale can be finalized
  const canFinalizeSale =
    currentCart.length > 0 &&
    currentCart.every((item) => item.approval_status === "approved") &&
    tableBarRequestStatus !== "pending";

  return {
    // State
    selectedProduct,
    quantity,
    customSellingPrice,
    paymentMethod,
    selectedProductData,
    currentCart,
    currentTotal,
    currentTotalProfit,
    tableBarRequestStatus,
    unitPrice,
    totalPrice,

    // Enhanced state
    approvedItems,
    pendingItems,
    approvedTotal,
    pendingTotal,
    hasPendingItems,
    canFinalizeSale,

    // Setters
    setSelectedProduct,
    setQuantity,
    setCustomSellingPrice,
    setPaymentMethod,

    // Handlers
    handleProductChange,
    handleQuantityChange,
    handleSellingPriceChange,
    handleAddToCart,
    removeFromCart,
    updateCartItemQuantity,
    handleSendToBar,
    handleFinalizeSale,
    handleBarApprovalReceived,

    // Mutations
    createSaleMutation,
    createBarRequestMutation,
  };
}
