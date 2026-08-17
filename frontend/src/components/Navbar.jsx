import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { LogOut, PlusSquare, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <nav className="bg-white border-b border-slate-100 p-4 sticky top-0 z-[100] w-full">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl italic font-black tracking-tighter">
                    <span className="text-[#e1a32a]">Recipe</span>
                    <span className="text-[#f39c12]">Share</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/" className="text-slate-600 hover:text-orange-500 transition-colors font-medium">Начало</Link>
                    
                    {user ? (
                        <>
                            <Link to="/create-recipe" className="flex items-center gap-1 text-slate-600 hover:text-orange-500 transition-colors font-medium">
                                <PlusSquare size={20} /> <span className="hidden md:inline">Нова рецепта</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-1 text-slate-600 hover:text-orange-500 transition-colors font-medium">
                                <User size={20} /> <span>{user.username}</span>
                            </Link>
                            <button onClick={() => { logout(); navigate('/login'); }} className="text-slate-400 hover:text-red-500 transition">
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="bg-slate-950 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-500 transition shadow-sm">
                            Вход
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;