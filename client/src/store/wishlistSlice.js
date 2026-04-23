import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../utils/axios";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.wishlist.products.map((p) => p._id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async ({ productId, token }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "/wishlist/toggle",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return { productId, added: data.added };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {
    clearWishlistState: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, added } = action.payload;
        if (added) {
          state.items.push(productId);
        } else {
          state.items = state.items.filter((id) => id !== productId);
        }
      });
  },
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
