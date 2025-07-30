"use client";

import { useCreateSale } from "@/app/components/queryhooks/useCreateSale";
import { useProducts } from "@/app/components/queryhooks/useProducts";
import { FormatCurrency } from "@/app/hooks/useFormatCurrency";
import { ShoppingCart, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import SaleForm from "./SaleForm";
import ShoppingCartDisplay from "./ShoppingCartDisplay";
import type { Product, SaleItem } from "./types";

interface AddToSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export default function AddToSaleModal({
  isOpen,
  onClose,
  isDarkMode = false,
}: AddToSaleModalProps) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customSellingPrice, setCustomSellingPrice] = useState(0);
  const { products } = useProducts();
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const createSaleMutation = useCreateSale();

  // Find the selected product from the products array
  const selectedProductData = products?.find(
    (product) => product.name === selectedProduct
  );

  // Calculate prices based on selected product data
  const unitPrice =
    customSellingPrice || selectedProductData?.selling_price || 0;
  const unitCost = selectedProductData?.cost_price || 0;
  const totalPrice = unitPrice * quantity;
  const profitAmount = totalPrice - unitCost * quantity;

  // Calculate cart totals
  const cartTotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  const cartTotalCost = cartItems.reduce(
    (sum, item) => sum + item.total_cost,
    0
  );
  const cartTotalProfit = cartTotal - cartTotalCost;

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

    const existingCartQuantity = cartItems
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
    };

    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.product_id === newItem.product_id &&
        item.unit_price === newItem.unit_price
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cartItems];
      const existingItem = updatedCart[existingItemIndex];
      updatedCart[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + newItem.quantity,
        total_price: existingItem.total_price + newItem.total_price,
        total_cost: existingItem.total_cost + newItem.total_cost,
        profit_amount: existingItem.profit_amount + newItem.profit_amount,
      };
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, newItem]);
    }

    toast.success(`${newItem.name} added to cart!`);
    setSelectedProduct("");
    setQuantity(1);
    setCustomSellingPrice(0);
  };

  // Remove item from cart
  const removeFromCart = (index: number) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    toast.success("Item removed from cart");
  };

  // Update cart item quantity
  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const item = cartItems[index];
    const product = products?.find((p) => p.id === item.product_id);

    if (product) {
      const currentProductInCartQuantity = cartItems
        .filter(
          (cartItem, i) => i !== index && cartItem.product_id === product.id
        )
        .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      if (currentProductInCartQuantity + newQuantity > product.current_stock) {
        toast.error("Not enough stock available");
        return;
      }
    }

    const updatedCart = [...cartItems];
    updatedCart[index] = {
      ...item,
      quantity: newQuantity,
      total_price: item.unit_price * newQuantity,
      total_cost: item.unit_cost * newQuantity,
      profit_amount:
        item.unit_price * newQuantity - item.unit_cost * newQuantity,
    };
    setCartItems(updatedCart);
  };

  // Finalize sale
  const handleFinalizeSale = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const saleData = {
        total_amount: cartTotal,
        payment_method: paymentMethod,
        items: cartItems,
      };

      createSaleMutation.mutate(saleData, {
        onSuccess: () => {
          setCartItems([]);
          onClose();
          setIsCartOpenMobile(false);
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
  const filteredProducts = products?.filter((item) => item.current_stock !== 0);
  // Group products by category for better organization
  const groupedProducts = filteredProducts?.reduce((groups, product) => {
    const category = product.category || "Other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<string, Product[]>);

  // Category display names and emojis
  const categoryDisplayNames: Record<string, { label: string; emoji: string }> =
    {
      beverages: { label: "Beverages", emoji: "🥤" },
      beer: { label: "Beers", emoji: "🍺" },
      premium: { label: "Alcoholic Drinks", emoji: "🍸" },
      energy: { label: "Energy Drinks", emoji: "⚡" },
      alcoholic: { label: "Alcoholic Drinks", emoji: "🍸" },
      other: { label: "Other", emoji: "📦" },
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-6xl mx-auto my-4 sm:my-8 rounded-lg sm:rounded-xl shadow-2xl transition-all ${
          isDarkMode
            ? "bg-slate-800 text-slate-100 border border-slate-700"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center gap-2 justify-between O mt-5 p-3 sm:p-6 border-b ${
            isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-lg sm:text-xl md:text-2xl font-bold ${
              isDarkMode ? "text-slate-100" : "text-gray-900"
            }`}
          >
            Add New Sale
          </h2>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Shopping Cart button for mobile */}
            <button
              type="button"
              onClick={() => setIsCartOpenMobile(true)}
              className={`md:hidden flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Cart</span> ({cartItems.length}
              )
            </button>
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-full hover:scale-110 ${
                isDarkMode
                  ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content - Two columns on desktop, single column on mobile */}
        <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] sm:h-[calc(100vh-20rem)] max-h-[500px] sm:max-h-[600px]">
          {/* Left Column: Sale Form */}
          <div
            className={`flex-1 p-3 sm:p-6 overflow-y-auto ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <SaleForm
              products={products}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              quantity={quantity}
              setQuantity={setQuantity}
              customSellingPrice={customSellingPrice}
              setCustomSellingPrice={setCustomSellingPrice}
              selectedProductData={selectedProductData}
              unitPrice={unitPrice}
              totalPrice={totalPrice}
              handleProductChange={handleProductChange}
              handleQuantityChange={handleQuantityChange}
              handleSellingPriceChange={handleSellingPriceChange}
              handleAddToCart={handleAddToCart}
              groupedProducts={groupedProducts}
              categoryDisplayNames={categoryDisplayNames}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Right Column: Shopping Cart Display (Desktop) */}
          <ShoppingCartDisplay
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateCartItemQuantity={updateCartItemQuantity}
            cartTotal={cartTotal}
            cartTotalProfit={cartTotalProfit}
            isDarkMode={isDarkMode}
            products={products}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            handleFinalizeSale={handleFinalizeSale}
            createSaleMutation={createSaleMutation}
            isOpen={isCartOpenMobile}
            onClose={() => setIsCartOpenMobile(false)}
          />
        </div>

        {/* Modal Footer with Cart Summary and Actions */}
        <div
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center px-3 sm:px-6 py-3 sm:py-4 border-t gap-3 sm:gap-4 ${
            isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          {/* Cart Summary Section */}
          <div className="flex-1 w-full sm:w-auto">
            {cartItems.length > 0 && (
              <div className="space-y-1.5 sm:space-y-2">
                {/* Cart Items Count and Total */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        isDarkMode ? "text-slate-300" : "text-gray-600"
                      }`}
                    >
                      {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}{" "}
                      in cart
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span
                      className={`text-xs sm:text-sm ${
                        isDarkMode ? "text-slate-300" : "text-gray-600"
                      }`}
                    >
                      Total:
                    </span>
                    <span
                      className={`text-base sm:text-lg font-bold ${
                        isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}
                    >
                      {FormatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex flex-col sm:flex-row sm:items-center  gap-1.5 sm:gap-2">
                  <label
                    htmlFor="payment-method-footer"
                    className={`text-xs sm:text-sm font-medium ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    Payment Method:
                  </label>
                  <select
                    id="payment-method-footer"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border text-xs sm:text-sm appearance-none w-full sm:w-auto ${
                      isDarkMode
                        ? "bg-slate-600 border-slate-500 text-slate-100 focus:border-slate-400"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      isDarkMode
                        ? "focus:ring-slate-400"
                        : "focus:ring-blue-500"
                    }`}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium hover:scale-105 transition-transform ${
                isDarkMode
                  ? "border border-slate-600 text-slate-300 hover:bg-slate-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Close
            </button>

            {cartItems.length > 0 && (
              <button
                onClick={handleFinalizeSale}
                disabled={createSaleMutation.isPending}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {createSaleMutation.isPending
                  ? "Finalizing..."
                  : "Finalize Sale"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
