"use client";

import type React from "react";

import { X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useProducts } from "@/app/components/queryhooks/useProducts";
import { useCreateSale } from "@/app/components/queryhooks/useCreateSale";
import type { SaleItem, Product } from "./types";
import SaleForm from "./SaleForm";
import SaleSummaryAndActions from "./SaleSummaryAndActions";
import ShoppingCartDisplay from "./ShoppingCartDisplay";

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
  const [showCart, setShowCart] = useState(false);
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
    // Pre-fill the selling price when a product is selected
    if (productName) {
      const product = products?.find((p) => p.name === productName);
      setCustomSellingPrice(product?.selling_price || 0);
    } else {
      setCustomSellingPrice(0);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string (when user deletes all content)
    if (value === "") {
      setQuantity(0); // or you could use a string state instead
      return;
    }

    const numValue = Number(value);

    // Only update if it's a valid positive number
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

    // Check if there's enough stock (considering what's already in cart)
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

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.product_id === newItem.product_id &&
        item.unit_price === newItem.unit_price
    );

    if (existingItemIndex >= 0) {
      // Update existing item
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
      // Add new item
      setCartItems([...cartItems, newItem]);
    }

    toast.success(`${newItem.name} added to cart!`);
    // Reset form
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

    if (product && newQuantity > product.current_stock) {
      toast.error("Not enough stock available");
      return;
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
          toast.success("Sale completed successfully!");
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

  // Group products by category for better organization
  const groupedProducts = products?.reduce((groups, product) => {
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
      soft_drinks: { label: "Soft Drinks", emoji: "🥤" },
      other: { label: "Other", emoji: "📦" },
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-6xl mx-auto my-8 rounded-xl shadow-2xl transition-all ${
          isDarkMode
            ? "bg-slate-800 text-slate-100 border border-slate-700"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-slate-100" : "text-gray-900"
            }`}
          >
            Add New Sale
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCart(!showCart)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Cart ({cartItems.length})
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-full hover:scale-110 ${
                isDarkMode
                  ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex">
          {/* Main form section */}
          <div
            className={`flex-1 ${showCart ? "border-r" : ""} ${
              isDarkMode ? "border-slate-700" : "border-gray-200"
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
            {/* Corrected: Added SaleSummaryAndActions here */}
            <div className="p-6 pt-0">
              {" "}
              {/* Added padding top 0 to avoid double padding */}
              <SaleSummaryAndActions
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                handleFinalizeSale={handleFinalizeSale}
                cartTotal={cartTotal}
                cartItems={cartItems}
                createSaleMutation={createSaleMutation}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
          {/* Cart section */}
          {showCart && (
            <ShoppingCartDisplay
              cartItems={cartItems}
              removeFromCart={removeFromCart}
              updateCartItemQuantity={updateCartItemQuantity}
              cartTotal={cartTotal}
              cartTotalProfit={cartTotalProfit}
              isDarkMode={isDarkMode}
              products={products} // Pass products for stock check in quantity update
            />
          )}
        </div>
        {/* Footer */}
        <div
          className={`flex justify-between items-center px-6 py-4 border-t ${
            isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <div
            className={`text-sm ${
              isDarkMode ? "text-slate-300" : "text-gray-600"
            }`}
          >
            {cartItems.length > 0 && (
              <span>Cart Total: ₦{cartTotal.toFixed(2)}</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-lg font-medium hover:scale-105 ${
                isDarkMode
                  ? "border border-slate-600 text-slate-300 hover:bg-slate-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
