import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { LogOut, PlusSquare, User, Home, ShieldCheck, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-slate-100 p-4 sticky top-0 z-[40] w-full shadow-sm">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link to="/" onClick={closeMenu} className="text-2xl italic font-black tracking-tighter shrink-0">
                    <span className="text-[#e1a32a]">Recipe</span>
                    <span className="text-[#f39c12]">Share</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-1.5 text-slate-600 hover:text-orange-500 transition-colors font-bold text-sm">
                        <Home size={18} /> <span>Начало</span>
                    </Link>

                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-1.5 text-red-500 hover:text-red-700 transition-colors font-bold text-sm border-slate-200 pr-3 -mr-3"
                                >
                                    <ShieldCheck size={18} /> <span>Админ панел</span>
                                </Link>
                            )}

                            <Link to="/create-recipe" className="flex items-center gap-1.5 text-slate-600 hover:text-orange-500 transition-colors font-bold text-sm">
                                <PlusSquare size={18} /> <span>Нова рецепта</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-1.5 text-slate-600 hover:text-orange-500 transition-colors font-bold text-sm">
                                <User size={18} /> <span>{user.username}</span>
                            </Link>
                            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="bg-slate-950 text-white px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition shadow-lg">
                            Вход
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button onClick={toggleMenu} className="md:hidden text-slate-950 p-1 hover:bg-slate-50 rounded-lg transition-colors">
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-2xl p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    <Link to="/" onClick={closeMenu} className="flex items-center gap-4 text-slate-900 font-bold text-lg border-b border-slate-50 pb-4">
                        <Home className="text-orange-500" /> Начало
                    </Link>

                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" onClick={closeMenu} className="flex items-center gap-4 text-red-600 font-bold text-lg border-b border-slate-50 pb-4">
                                    <ShieldCheck /> Админ панел
                                </Link>
                            )}
                            <Link to="/create-recipe" onClick={closeMenu} className="flex items-center gap-4 text-slate-900 font-bold text-lg border-b border-slate-50 pb-4">
                                <PlusSquare className="text-orange-500" /> Нова рецепта
                            </Link>
                            <Link to="/profile" onClick={closeMenu} className="flex items-center gap-4 text-slate-900 font-bold text-lg border-b border-slate-50 pb-4">
                                <User className="text-orange-500" /> Профил
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-4 text-red-500 font-bold text-lg w-full text-left"
                            >
                                <LogOut /> Изход
                            </button>
                        </>
                    ) : (
                        <Link to="/login" onClick={closeMenu} className="block text-center bg-slate-950 text-white py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl">
                            Вход
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;