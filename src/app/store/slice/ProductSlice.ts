import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getFromLocalStorage, setInLocalStorage } from "@/app/utills/LocalStorageUtills";
import CategoryModels from "@/app/modal/CategoryModels";
import { ProductsModels } from "@/app/modal/ProductModels";

interface CartState {
  products: ProductsModels[];
  category: CategoryModels[];
  cart: Record<string, ProductsModels[]>; // Dynamic meal type
}

const initialState: CartState = {
  products: [],
  category: [],
  cart: {},
};

const ProductSlice = createSlice({
  name: "Product",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<ProductsModels[]>) => {
      state.products = action.payload;
    },
    addCategory: (state, action: PayloadAction<CategoryModels[]>) => {
      state.category = action.payload;
    },
    addToCart: (state, action: PayloadAction<ProductsModels>) => {
      const mealType: string = action.payload.meal.Name.toLowerCase();

      if (!state.cart[mealType]) {
        state.cart[mealType] = [];
      }

      state.cart[mealType] = state.cart[mealType].filter(
        (item) => item.category !== action.payload.category
      );

      state.cart[mealType].push(action.payload);
    },
    resetCart: (state) => {
      state.cart = {};
    },
    loadCartFromLocalStorage: (state) => {
      for (const mealType in state.cart) {
        const storedCart = getFromLocalStorage(`cart${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`);
        if (storedCart) {
          state.cart[mealType] = storedCart;
        }
      }
    },
  },
});

export const { addToCart, addCategory, addProduct, resetCart, loadCartFromLocalStorage } = ProductSlice.actions;

export default ProductSlice;
