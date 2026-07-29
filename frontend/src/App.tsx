import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { CustomersList } from './pages/Customers/CustomersList';
import { CustomerForm } from './pages/Customers/CustomerForm';
import { ProductsList } from './pages/Products/ProductsList';
import { ProductForm } from './pages/Products/ProductForm';
import { ChallansList } from './pages/Challans/ChallansList';
import { ChallanForm } from './pages/Challans/ChallanForm';
import { Landing } from './pages/Landing/Landing';
import { ForgotPassword } from './pages/Auth/ForgotPassword';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Removed Settings placeholder

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected Routes inside MainLayout */}
              <Route element={<MainLayout />}>
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>

                {/* Customers: Admin, Sales, Accounts */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />}>
                  <Route path="/customers" element={<CustomersList />} />
                  <Route path="/customers/new" element={<CustomerForm />} />
                  <Route path="/customers/:id" element={<CustomerForm />} />
                  <Route path="/customers/:id/edit" element={<CustomerForm />} />
                </Route>
                
                {/* Products: Admin, Warehouse */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />}>
                  <Route path="/products" element={<ProductsList />} />
                  <Route path="/products/new" element={<ProductForm />} />
                  <Route path="/products/:id" element={<ProductForm />} />
                  <Route path="/products/:id/edit" element={<ProductForm />} />
                </Route>
                
                {/* Challans: Admin, Sales, Accounts */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />}>
                  <Route path="/challans" element={<ChallansList />} />
                  <Route path="/challans/new" element={<ChallanForm />} />
                  <Route path="/challans/:id" element={<ChallanForm />} />
                  <Route path="/challans/:id/edit" element={<ChallanForm />} />
                </Route>
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
