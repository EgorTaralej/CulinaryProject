import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home, { homeLoader } from '@/pages/Home';
import RecipeDetails, { recipeLoader } from '@/pages/RecipeDetails';
import CreateRecipe from '@/pages/CreateRecipe';
import { Toaster } from "@/components/ui/toaster";

const Layout = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {user && <Navbar />}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Toaster />
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
          element: user ? <Home /> : <Navigate to="/login" />,
          loader: homeLoader
        },
        {
          path: "recipe/:id",
          element: user ? <RecipeDetails /> : <Navigate to="/login" />,
          loader: recipeLoader
        },
        {
          path: "create-recipe",
          element: user ? <CreateRecipe /> : <Navigate to="/login" />
        },
        {
          path: "login",
          element: !user ? <Login /> : <Navigate to="/" />
        },
        {
          path: "register",
          element: !user ? <Register /> : <Navigate to="/" />
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;