import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "./store/store";
import App from "./App.jsx";
import "./index.css";
import { fetchWishlist } from "./store/wishlistSlice";

const token = localStorage.getItem("token");
if (token) {
  store.dispatch(fetchWishlist(token));
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
