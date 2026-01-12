import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Support from "./pages/Support";
import Tracking from "./pages/Tracking";
import IndicateAndEarn from "./pages/IndicateAndEarn";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import TermsConditions from "./pages/Terms$Conditions";
import PrivacyPolicy from "./pages/Privacy$Policy";
import CancellationPolicy from "./pages/CancellationPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import { CartSyncManager } from "./components/CartSyncManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartSyncManager />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/produtos" element={<Products />} />
            <Route path="/produto/:id" element={<ProductDetail />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedidos" element={<Orders />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/suporte" element={<Support />} />
            <Route path="/rastreio" element={<Tracking />} />
            <Route path="/indique-e-ganhe" element={<IndicateAndEarn />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/terms$conditions" element={<TermsConditions />} />
            <Route path="/privacy$policy" element={<PrivacyPolicy />} />
            <Route path="/cancellation-policy" element={<CancellationPolicy />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
