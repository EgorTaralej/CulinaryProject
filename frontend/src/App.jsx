import { createBrowserRouter, RouterProvider, Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home, { homeLoader } from '@/pages/Home';
import RecipeDetails, { recipeLoader } from '@/pages/RecipeDetails';
import CreateRecipe, { categoriesLoader } from '@/pages/CreateRecipe';
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

function App() {
  const { user } = useContext(AuthContext);

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
          element: user ? <CreateRecipe /> : <Navigate to="/login" />,
          loader: categoriesLoader
        },
        {
          path: "login",
          element: !user ? <Login /> : <Navigate to="/" />
        },
        {
          path: "register",
          element: !user ? <Register /> : <Navigate to="/" />
        },
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;