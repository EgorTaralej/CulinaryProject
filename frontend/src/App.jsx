import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold">Здравей, {user?.username}!</h1>
      <button onClick={logout} className="mt-4 text-red-500 underline">Изход</button>
    </div>
  );
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
      
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;