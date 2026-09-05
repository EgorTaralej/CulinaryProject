import { createBrowserRouter, RouterProvider, Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home, { homeLoader } from '@/pages/Home';
import RecipeDetails, { recipeLoader } from '@/pages/RecipeDetails';
import CreateRecipe, { categoriesLoader } from '@/pages/CreateRecipe';
import EditRecipe, { editRecipeLoader } from '@/pages/EditRecipe';
import Profile, { profileLoader } from '@/pages/Profile';
import AdminDashboard, { adminLoader } from '@/pages/AdminDashboard';
import { Toaster } from "@/components/ui/toaster";

const Layout = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-white font-sans text-slate-950">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet key={location.key} />
      </main>
      <Toaster />
      <ScrollRestoration />
    </div>
  );
};

function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (user) return <Navigate to="/" />;
  return children;
}

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
        loader: homeLoader
      },
      {
        path: "recipe/:id",
        element: <RecipeDetails />,
        loader: recipeLoader
      },
      {
        path: "create-recipe",
        element: <ProtectedRoute><CreateRecipe /></ProtectedRoute>,
        loader: categoriesLoader
      },
      {
        path: "recipe/:id/edit",
        element: <ProtectedRoute><EditRecipe /></ProtectedRoute>,
        loader: editRecipeLoader
      },
      {
        path: "profile/:id?",
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
        loader: profileLoader
      },
      {
        path: "login",
        element: <PublicRoute><Login /></PublicRoute>
      },
      {
        path: "register",
        element: <PublicRoute><Register /></PublicRoute>
      },
      {
        path: "admin",
        element: <AdminRoute><AdminDashboard /></AdminRoute>,
        loader: adminLoader
      },
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;