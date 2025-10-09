"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useCreateProduct } from "../queryhooks/useCreateProducts";
import AddProductsSubmitButton from "./AddProductsSubmitButton";

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

// Product to category mapping
const PRODUCT_CATEGORIES = {
  // Beers
  big_stout: "beer",
  medium_stout: "beer",
  goldberg: "beer",
  gulder: "beer",
  heineken: "beer",
  legend: "beer",
  "33_export": "beer",
  tiger: "beer",
  trophy: "beer",
  radler: "beer",
  desperado: "beer",
  castle_lite: "beer",
  small_legend: "beer",
  small_heineken: "beer",

  // Alcoholic
  big_orijin: "alcoholic",
  smooth: "alcoholic",
  fayrouz: "alcoholic",
  plastic_orijin: "alcoholic",
  campari: "alcoholic",
  baileys: "alcoholic",
  red_label: "premium",
  ace_root: "alcoholic",
  best: "alcoholic",
  small_smirnoff: "alcoholic",
  medium_gurana: "alcoholic",
  gurana: "alcoholic",
  action_bitters: "alcoholic",

  // Soft drinks / Beverages
  malta: "beverages",
  big_ice: "beverages",
  maltina: "beverages",
  coke: "beverages",
  black_trophy: "beverages",
  water: "beverages",
  hollandia: "beverages",
  exotic: "beverages",
  salive: "beverages",

  // Energy drinks
  fearless: "energy",
  predator: "energy",
  climax: "energy",
  monster: "energy",
  flying_fish: "energy",
  bullet: "energy",
};

export default function AddProductModal({
  isOpen,
  onClose,
  isDarkMode = false,
}: AddProductFormProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const { mutate: createProduct } = useCreateProduct();

  const profit = sellingPrice - costPrice;

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productValue = e.target.value;
    const category =
      PRODUCT_CATEGORIES[productValue as keyof typeof PRODUCT_CATEGORIES];
    setSelectedCategory(category || "");
  };
  async function handleCreateProduct(formdata: FormData) {
    createProduct(formdata, {
      onSuccess: () => {
        onClose();
      },
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-4xl mx-auto my-8 rounded-xl shadow-2xl transition-all ${
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
            Add New Product
          </h2>
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

        <form action={handleCreateProduct} className="space-y-6">
          {/* Hidden Inputs */}
          <input type="hidden" name="category" value={selectedCategory} />
          <input type="hidden" name="profit" value={profit} />

          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="space-y-3">
                <label
                  htmlFor="productName"
                  className={`block text-sm font-semibold ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Product Name *
                </label>
                <select
                  name="name"
                  id="name"
                  defaultValue=""
                  onChange={handleProductChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Select a product</option>

                  <optgroup label="🍺 Beers">
                    <option value="big_stout">Big Stout</option>
                    <option value="medium_stout">Medium Stout</option>
                    <option value="goldberg">Goldberg</option>
                    <option value="gulder">Gulder</option>
                    <option value="heineken">Heineken</option>
                    <option value="legend">Legend</option>
                    <option value="33_export">33 Export</option>
                    <option value="tiger">Tiger</option>
                    <option value="trophy">Trophy</option>
                    <option value="radler">Radler</option>
                    <option value="desperado">Desperado</option>
                    <option value="castle_lite">Castle Lite</option>
                    <option value="small_legend">Small Legend</option>
                    <option value="small_heineken">Small Heineken</option>
                  </optgroup>

                  <optgroup label="🍸 Alcoholic Drinks">
                    <option value="big_orijin">Big Orijin</option>
                    <option value="smooth">Smooth</option>
                    <option value="fayrouz">Fayrouz</option>
                    <option value="plastic_orijin">Plastic Orijin</option>
                    <option value="campari">Campari</option>
                    <option value="baileys">Baileys</option>
                    <option value="red_label">Johnnie Walker Red Label</option>
                    <option value="ace_root">Ace Root</option>
                    <option value="best">Best</option>
                    <option value="small_smirnof">Small Smirnoff</option>
                    <option value="medium_gorana">Medium Gurana</option>
                    <option value="gorana">Gurana</option>
                    <option value="action_bitters">Action Bitters</option>
                  </optgroup>

                  <optgroup label="🥤 Soft Drinks">
                    <option value="malta">Malta</option>
                    <option value="big_ice">Big Ice</option>
                    <option value="maltina">Maltina</option>
                    <option value="coke">Coca-Cola</option>
                    <option value="black_trophy">Black Trophy</option>
                    <option value="water">Water</option>
                    <option value="hollandia">Hollandia</option>
                    <option value="exotic">Exotic</option>
                    <option value="salive">Salive</option>
                  </optgroup>

                  <optgroup label="⚡ Energy Drinks">
                    <option value="fearless">Fearless</option>
                    <option value="predator">Predator</option>
                    <option value="climax">Climax</option>
                    <option value="monster">Monster</option>
                    <option value="flying_fish">Flying Fish</option>
                    <option value="bullet">Bullet</option>
                  </optgroup>
                </select>
              </div>

              {/* Category (read-only) */}
              <div className="space-y-3">
                <label
                  htmlFor="category"
                  className={`block text-sm font-semibold ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Category *
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  disabled
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="beverages">Beverages</option>
                  <option value="alcoholic">Alcoholic</option>
                  <option value="beer">Beer</option>
                  <option value="premium">Premium</option>
                  <option value="energy">energy</option>
                </select>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label
                  htmlFor="costPrice"
                  className={`block text-sm font-semibold ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Cost Price (₦) *
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    ₦
                  </span>
                  <input
                    type="number"
                    name="cost_price"
                    id="cost_price"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border-2 ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-slate-100"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="sellingPrice"
                  className={`block text-sm font-semibold ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Selling Price (₦) *
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    ₦
                  </span>
                  <input
                    type="number"
                    name="selling_price"
                    id="selling_price"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border-2 ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-slate-100"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Stock Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label
                  htmlFor="currentStock"
                  className={`block text-sm font-semibold ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Current Stock *
                </label>
                <input
                  type="number"
                  name="current_stock"
                  id="current_stock"
                  min="0"
                  placeholder="0"
                  required
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="lowStock"
                  className={`block text-sm font-semibold ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Low Stock Alert Level *
                </label>
                <input
                  type="number"
                  name="low_stock"
                  id="low_stock"
                  min="0"
                  placeholder="10"
                  required
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`flex justify-end gap-3 px-6 py-4 border-t ${
              isDarkMode ? "border-slate-700" : "border-gray-200"
            }`}
          >
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
            <AddProductsSubmitButton isDarkMode={isDarkMode}>
              Add Product
            </AddProductsSubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
