import { useState } from "react";
import { useTableCartStore } from "@/app/(store)/useTableCartStore";
import { useCreateSale } from "@/app/components/queryhooks/useCreateSale";
import { useCreateBarRequest } from "@/app/components/queryhooks/useBarRequests";
import toast from "react-hot-toast";
import type { SaleItem, BarRequest, Product } from "../(sales)/types";

interface UseTableCartLogicProps {
  products?: Product[];
  currentUser?: {
    id: string;
    name: string;
  };
  currentUserId?: string; // Added this as it was missing from the interface
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
  } = useTableCartStore();

  const currentCart = getTableCart(selectedTable);
  console.log("Current cart:", currentCart);
  const currentTotal = getTableTotal(selectedTable);
  const tableBarRequestStatus = getTableBarRequestStatus(selectedTable);

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

  // Add item to cart
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
    };

    addToTableCart(selectedTable, newItem);
    toast.success(`${newItem.name} added to Table ${selectedTable} cart!`);

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

  // Send bar request
  const handleSendToBar = async () => {
    if (currentCart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!currentUser) {
      toast.error("User information not available");
      return;
    }

    try {
      const barRequestItems: Omit<BarRequest, "id">[] = currentCart.map(
        (item) => ({
          table_id: selectedTable,
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          sales_rep_id: currentUserId,
          sales_rep_name: currentUser,
          status: "pending",
        })
      );

      createBarRequestMutation.mutate(barRequestItems, {
        onSuccess: () => {
          toast.success(`Bar request sent for Table ${selectedTable}!`);
          setTableBarRequestStatus(selectedTable, "pending");
        },
        onError: (error) => {
          toast.error("Failed to send bar request");
          console.error("Bar request error:", error);
        },
      });
    } catch (error) {
      toast.error("Failed to send bar request");
      console.error("Bar request error:", error);
    }
  };

  // Finalize sale - FIXED VERSION
  const handleFinalizeSale = async () => {
    if (currentCart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (tableBarRequestStatus === "pending") {
      toast.error(
        "Cannot finalize sale while bar request is pending. Wait for bartender to fulfill the order."
      );
      return;
    }

    if (tableBarRequestStatus === "none") {
      toast.error("Please send items to bar first before finalizing sale.");
      return;
    }

    try {
      const saleData = {
        total_amount: currentTotal,
        payment_method: paymentMethod,
        items: currentCart,
        table_id: selectedTable,
      };

      console.log("Finalizing sale for table:", selectedTable);
      console.log("Cart before clearing:", currentCart);

      createSaleMutation.mutate(saleData, {
        onSuccess: () => {
          console.log(
            "Sale successful, clearing cart for table:",
            selectedTable
          );

          // Clear the cart first
          clearTableCart(selectedTable);

          // Reset bar request status
          setTableBarRequestStatus(selectedTable, "none");

          // Verify cart is cleared
          const updatedCart = getTableCart(selectedTable);
          console.log("Cart after clearing:", updatedCart);

          toast.success(`Sale completed for Table ${selectedTable}!`);

          // Force a re-render by updating component state if needed
          // You might need to trigger a parent component re-render here
        },
        onError: (error) => {
          toast.error("Failed to complete sale");
          console.error("Sale error:", error);
        },
      });
    } catch (error) {
      toast.error("Failed to complete sale");
      console.error("Sale error:", error);
    }
  };

  return {
    // State
    selectedProduct,
    quantity,
    customSellingPrice,
    paymentMethod,
    selectedProductData,
    currentCart,
    currentTotal,
    tableBarRequestStatus,
    unitPrice,
    totalPrice,

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

    // Mutations
    createSaleMutation,
    createBarRequestMutation,
  };
}
