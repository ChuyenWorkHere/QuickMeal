import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { routes } from "./routes";
import NotFound from "@/pages/NotFoundPage";
import PublicLayout from "@/layouts/PublicLayout";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { ProductProvider } from '@/context/ProductContext';

function App() {
  return (
    <AuthProvider>
      <ProductProvider>

        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <Routes>
            {routes.map((r, i) => {
              const Page = r.element;
              const Layout = r.layout ?? (({ children }: any) => <>{children}</>);

              // Chuyển role thành mảng để dễ check
              const allowedRoles = Array.isArray(r.role) ? r.role : [r.role ?? "public"];

              return (
                <Route
                  key={i}
                  path={r.path}
                  element={
                    <ProtectedRoute allowedRoles={allowedRoles}>
                      <Layout>
                        <Page />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              );
            })}

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <PublicLayout>
                  <NotFound />
                </PublicLayout>
              }
            />
          </Routes>
        </BrowserRouter>

      </ProductProvider>
    </AuthProvider >
  );
}

export default App;
