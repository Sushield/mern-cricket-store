import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminPlayersPage from "./pages/admin/AdminPlayersPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import PlayerProductsPage from "./pages/PlayerProductsPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AdminBlogPage from "./pages/admin/AdminBlogPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import KYCPage from "./pages/KYCPage";
import AdminKYCPage from "./pages/admin/AdminKYCPage";
import AdminPreOrdersPage from "./pages/admin/AdminPreOrdersPage";
import WishlistPage from "./pages/WishlistPage";
import AdminCouponsPage from "./pages/admin/AdminCouponsPage";

function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/players" element={<AdminPlayersPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/players/:id" element={<PlayerProductsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/admin/blog" element={<AdminBlogPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/kyc" element={<KYCPage />} />
          <Route path="/admin/kyc" element={<AdminKYCPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/admin/preorders" element={<AdminPreOrdersPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/admin/coupons" element={<AdminCouponsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
