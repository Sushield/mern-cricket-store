import { createSlice } from "@reduxjs/toolkit";

const savedCart = localStorage.getItem("cart");
const savedCoupon = localStorage.getItem("coupon");

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: savedCart ? JSON.parse(savedCart) : [],
    coupon: savedCoupon ? JSON.parse(savedCoupon) : null,
    discount: savedCoupon ? JSON.parse(savedCoupon).discount : 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find(
        (item) => item._id === action.payload._id,
      );
      const price =
        action.payload.discountedPrice > 0
          ? action.payload.discountedPrice
          : action.payload.price;

      if (existing) {
        existing.qty += action.payload.qty || 1;
      } else {
        state.items.push({
          ...action.payload,
          qty: action.payload.qty || 1,
          price,
        });
      }
      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      localStorage.setItem("cart", JSON.stringify(state.items));

      // ✅ Invalidate coupon when cart changes
      state.coupon = null;
      state.discount = 0;
      localStorage.removeItem("coupon");
    },

    updateQty: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload.id);
      if (item) item.qty = action.payload.qty;
      localStorage.setItem("cart", JSON.stringify(state.items));

      // ✅ Invalidate coupon when cart changes
      state.coupon = null;
      state.discount = 0;
      localStorage.removeItem("coupon");
    },

    applyCoupon: (state, action) => {
      const { coupon, discount } = action.payload;
      state.coupon = coupon;
      state.discount = discount;
      localStorage.setItem("coupon", JSON.stringify({ ...coupon, discount }));
    },

    removeCoupon: (state) => {
      state.coupon = null;
      state.discount = 0;
      localStorage.removeItem("coupon");
    },

    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.discount = 0;
      localStorage.removeItem("cart");
      localStorage.removeItem("coupon");
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQty,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
