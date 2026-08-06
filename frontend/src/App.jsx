import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import CreateRecipe from '@/pages/CreateRecipe';
import { Toaster } from "@/components/ui/toaster";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* Показваме Navbar само ако има логнат потребител */}
      {user && <Navbar />}

      <main className="container mx-auto px-4">
        <Routes>
          {/* Начална страница - ако не си логнат, те праща към Login */}
          <Route 
            path="/" 
            element={user ? <Home /> : <Navigate to="/login" />} 
          />

          {/* Вход и Регистрация - ако си логнат, те връщат в Начало */}
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/" />} 
          />

          {/* Създаване на рецепта - защитен маршрут */}
          <Route 
            path="/create-recipe" 
            element={user ? <CreateRecipe /> : <Navigate to="/login" />} 
          />

          {/* Търсачка - временно като текст, докато я направим */}
          <Route 
            path="/search" 
            element={user ? (
              <div className="py-20 text-center text-2xl font-black text-slate-300 uppercase tracking-widest">
                Търсачката се разработва...
              </div>
            ) : <Navigate to="/login" />} 
          />

          {/* Резервен маршрут - ако напишеш грешен адрес, те праща в Начало */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Глобалният компонент за известия на Shadcn */}
      <Toaster />
    </div>
  );
}

export default App;