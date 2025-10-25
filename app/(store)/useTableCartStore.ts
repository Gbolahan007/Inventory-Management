import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SaleItem {
  id?: string;
  product_id: string;
  name: string;
  quantity: number;
  approved_quantity?: number; // Track how many units have been approved by bar
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  selling_price: number;
  sales_rep_id?: string;
  sales_rep_name?: string;
  fulfillment_id?: string;
}

export interface TableCart {
  tableId: number;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
}

interface TableState {
  cart: SaleItem[];
  barRequestStatus: "none" | "pending" | "approved";
  pendingBarRequestId: string | null;
}

interface TableCartState {
  carts: Record<number, TableCart>;
  tables: Record<number, TableState>;
  selectedTable: number;
  currentUserId?: string;
  getStore: () => TableCartState;

  setCurrentUser: (userId: string) => void;
  addToTableCart: (tableId: number, item: SaleItem) => void;
  removeFromTableCart: (
    tableId: number,
    productId: string,
    unitPrice: number
  ) => void;
  updateTableCartItemQuantity: (
    tableId: number,
    productId: string,
    unitPrice: number,
    newQuantity: number
  ) => void;
  clearTableCart: (tableId: number) => void;
  setSelectedTable: (tableId: number) => void;
  updateTableCartItemFulfillmentId: (
    tableId: number,
    productId: string,
    unitPrice: number,
    fulfillmentId: string
  ) => void;
  syncCartWithBarFulfillment: (
    tableId: number,
    fulfillmentId: string,
    updates: {
      product_id?: string;
      product_name?: string;
      quantity_approved?: number;
      unit_price?: number;
      status?: string;
    }
  ) => void;

  updateCartItemApprovedQuantity: (
    tableId: number,
    productId: string | null,
    unitPrice: number,
    approvedQty: number
  ) => void;
  resetApprovedQuantities: (tableId: number) => void;

  setBarRequestStatus: (
    tableId: number,
    status: "none" | "pending" | "approved",
    requestId?: string | null
  ) => void;
  getBarRequestStatus: (tableId: number) => "none" | "pending" | "approved";
  getPendingBarRequestId: (tableId: number) => string | null;

  getTableCart: (tableId: number) => SaleItem[];
  getTableTotal: (tableId: number) => number;
  getTableTotalCost: (tableId: number) => number;
  getTableTotalProfit: (tableId: number) => number;
  getActiveTables: () => number[];
  getAllCartsData: () => Record<number, TableCart>;
  finalizeTableSale: (tableId: number) => SaleItem[] | null;
}

export const useTableCartStore = create<TableCartState>()(
  persist(
    (set, get) => ({
      carts: {},
      tables: {},
      selectedTable: 1,
      currentUserId: undefined,

      setCurrentUser: (userId: string) => {
        set({ currentUserId: userId });
      },

      addToTableCart: (tableId: number, item: SaleItem) => {
        const { currentUserId, carts } = get();
        if (!currentUserId) throw new Error("User not authenticated");

        const now = new Date().toISOString();
        const currentCart = carts[tableId];

        const existingItemIndex = currentCart?.items.findIndex(
          (cartItem) =>
            cartItem.product_id === item.product_id &&
            cartItem.unit_price === item.unit_price
        );

        let updatedItems: SaleItem[];

        if (currentCart && existingItemIndex !== -1) {
          const existingItem = currentCart.items[existingItemIndex];
          const newQuantity = existingItem.quantity + item.quantity;
          const newTotalPrice = item.unit_price * newQuantity;
          const newTotalCost = item.unit_cost * newQuantity;
          const newProfitAmount = newTotalPrice - newTotalCost;

          updatedItems = [...currentCart.items];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            total_price: newTotalPrice,
            total_cost: newTotalCost,
            profit_amount: newProfitAmount,
          };
        } else {
          const newItem = {
            ...item,
            id: `local_${Date.now()}_${Math.random()}`,
            sales_rep_id: currentUserId,
            approved_quantity: 0, // Initialize approved_quantity to 0
          };
          updatedItems = currentCart
            ? [...currentCart.items, newItem]
            : [newItem];
        }

        set({
          carts: {
            ...carts,
            [tableId]: {
              tableId,
              items: updatedItems,
              created_at: currentCart?.created_at || now,
              updated_at: now,
            },
          },
        });
      },

      removeFromTableCart: (
        tableId: number,
        productId: string,
        unitPrice: number
      ) => {
        const { carts } = get();
        const currentCart = carts[tableId];

        if (!currentCart) return;

        const updatedItems = currentCart.items.filter(
          (item) =>
            !(item.product_id === productId && item.unit_price === unitPrice)
        );

        if (updatedItems.length === 0) {
          const { [tableId]: _, ...rest } = carts;
          set({ carts: rest });
        } else {
          set({
            carts: {
              ...carts,
              [tableId]: {
                ...currentCart,
                items: updatedItems,
                updated_at: new Date().toISOString(),
              },
            },
          });
        }
      },

      updateTableCartItemQuantity: (
        tableId: number,
        productId: string,
        unitPrice: number,
        newQuantity: number
      ) => {
        if (newQuantity <= 0) {
          get().removeFromTableCart(tableId, productId, unitPrice);
          return;
        }

        const { carts } = get();
        const currentCart = carts[tableId];
        if (!currentCart) return;

        const updatedItems = currentCart.items.map((item) => {
          if (item.product_id === productId && item.unit_price === unitPrice) {
            const newTotalPrice = unitPrice * newQuantity;
            const newTotalCost = item.unit_cost * newQuantity;
            const newProfitAmount = newTotalPrice - newTotalCost;

            return {
              ...item,
              quantity: newQuantity,
              total_price: newTotalPrice,
              total_cost: newTotalCost,
              profit_amount: newProfitAmount,
            };
          }
          return item;
        });

        set({
          carts: {
            ...carts,
            [tableId]: {
              ...currentCart,
              items: updatedItems,
              updated_at: new Date().toISOString(),
            },
          },
        });
      },

      clearTableCart: (tableId: number) => {
        const { carts } = get();
        const { [tableId]: _, ...rest } = carts;
        set({ carts: rest });
      },

      setSelectedTable: (tableId: number) => {
        set({ selectedTable: tableId });
      },

      updateTableCartItemFulfillmentId: (
        tableId: number,
        productId: string,
        unitPrice: number,
        fulfillmentId: string
      ) => {
        const { carts } = get();
        const currentCart = carts[tableId];
        if (!currentCart) return;

        const updatedItems = currentCart.items.map((item) => {
          if (item.product_id === productId && item.unit_price === unitPrice) {
            return { ...item, fulfillment_id: fulfillmentId };
          }
          return item;
        });

        set({
          carts: {
            ...carts,
            [tableId]: { ...currentCart, items: updatedItems },
          },
        });
      },

      syncCartWithBarFulfillment: (tableId, fulfillmentId, updates) => {
        const { carts } = get();
        const currentCart = carts[tableId];

        if (!currentCart) {
          console.warn(`No cart found for table ${tableId}`);
          return;
        }

        const now = new Date().toISOString();

        if (
          updates.status === "cancelled" ||
          updates.status === "removed" ||
          updates.quantity_approved === 0
        ) {
          const updatedItems = currentCart.items.filter((item) => {
            return item.fulfillment_id !== fulfillmentId;
          });

          if (updatedItems.length === 0) {
            const { [tableId]: _, ...rest } = carts;
            set({ carts: rest });
          } else {
            set({
              carts: {
                ...carts,
                [tableId]: {
                  ...currentCart,
                  items: updatedItems,
                  updated_at: now,
                },
              },
            });
          }
          return;
        }

        let itemFound = false;
        console.log(itemFound);
        const updatedItems = currentCart.items.map((item) => {
          const matches = item.fulfillment_id === fulfillmentId;

          if (matches) {
            itemFound = true;
            const newQuantity = updates.quantity_approved ?? item.quantity;
            const newUnitPrice = updates.unit_price ?? item.unit_price;
            const newProductId = updates.product_id ?? item.product_id;
            const newProductName = updates.product_name ?? item.name;

            const newTotalPrice = newQuantity * newUnitPrice;
            const newTotalCost = newQuantity * item.unit_cost;
            const newProfitAmount = newTotalPrice - newTotalCost;

            return {
              ...item,
              name: newProductName,
              product_id: newProductId,
              quantity: newQuantity,
              unit_price: newUnitPrice,
              selling_price: newUnitPrice,
              total_price: newTotalPrice,
              total_cost: newTotalCost,
              profit_amount: newProfitAmount,
              fulfillment_id: fulfillmentId,
            };
          }
          return item;
        });

        set({
          carts: {
            ...carts,
            [tableId]: {
              ...currentCart,
              items: updatedItems,
              updated_at: now,
            },
          },
        });
      },

      updateCartItemApprovedQuantity: (
        tableId: number,
        productId: string | null,
        unitPrice: number,
        approvedQty: number
      ) => {
        const { carts } = get();
        const currentCart = carts[tableId];
        if (!currentCart) return;

        const updatedItems = currentCart.items.map((item) => {
          if (item.product_id === productId && item.unit_price === unitPrice) {
            return {
              ...item,
              approved_quantity: (item.approved_quantity || 0) + approvedQty,
            };
          }
          return item;
        });

        set({
          carts: {
            ...carts,
            [tableId]: {
              ...currentCart,
              items: updatedItems,
              updated_at: new Date().toISOString(),
            },
          },
        });
      },

      resetApprovedQuantities: (tableId: number) => {
        const { carts } = get();
        const currentCart = carts[tableId];
        if (!currentCart) return;

        const updatedItems = currentCart.items.map((item) => ({
          ...item,
          approved_quantity: 0,
        }));

        set({
          carts: {
            ...carts,
            [tableId]: {
              ...currentCart,
              items: updatedItems,
              updated_at: new Date().toISOString(),
            },
          },
        });
      },

      setBarRequestStatus: (tableId, status, requestId = null) => {
        set((state) => ({
          tables: {
            ...state.tables,
            [tableId]: {
              ...(state.tables[tableId] || { cart: [] }),
              barRequestStatus: status,
              pendingBarRequestId: requestId,
            },
          },
        }));
      },

      getBarRequestStatus: (tableId) =>
        get().tables[tableId]?.barRequestStatus || "none",

      getPendingBarRequestId: (tableId) =>
        get().tables[tableId]?.pendingBarRequestId || null,

      getTableCart: (tableId) => get().carts[tableId]?.items || [],
      getTableTotal: (tableId) =>
        get()
          .getTableCart(tableId)
          .reduce((sum, item) => sum + item.total_price, 0),
      getTableTotalCost: (tableId) =>
        get()
          .getTableCart(tableId)
          .reduce((sum, item) => sum + item.total_cost, 0),
      getTableTotalProfit: (tableId) =>
        get()
          .getTableCart(tableId)
          .reduce((sum, item) => sum + item.profit_amount, 0),
      getActiveTables: () =>
        Object.keys(get().carts)
          .map(Number)
          .filter((id) => get().carts[id]?.items.length > 0)
          .sort((a, b) => a - b),
      getAllCartsData: () => get().carts,

      finalizeTableSale: (tableId) => {
        const cart = get().carts[tableId];
        if (!cart || cart.items.length === 0) return null;

        const saleItems = [...cart.items];
        get().clearTableCart(tableId);
        return saleItems;
      },
      getStore: () => get(),
    }),
    {
      name: "table-cart-storage",
      partialize: (state) => ({
        carts: state.carts,
        selectedTable: state.selectedTable,
        tables: state.tables,
      }),
    }
  )
);
