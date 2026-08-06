import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, Search, PlusSquare, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b p-4 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-extrabold text-red-600 tracking-tight">
                    Recipe<span className="text-gray-800">Share</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition">
                        <Home size={20} /> <span className="hidden md:inline font-medium">Начало</span>
                    </Link>
                    <Link to="/search" className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition">
                        <Search size={20} /> <span className="hidden md:inline font-medium">Търсене</span>
                    </Link>
                    
                    {user ? (
                        <>
                            <Link to="/create-recipe" className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition">
                                <PlusSquare size={20} /> <span className="hidden md:inline font-medium">Нова рецепта</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition">
                                <User size={20} /> <span className="hidden md:inline font-medium">{user.username}</span>
                            </Link>
                            <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition ml-2">
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="bg-red-600 text-white px-5 py-2 rounded-full font-bold hover:bg-red-700 shadow-md transition">
                            Вход
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;