import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            alert('Грешни данни за вход!');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 shadow-lg rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Вход в системата</h2>
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Имейл"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" // Сменено на red-500
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Парола"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" // Сменено на red-500
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="w-full bg-red-600 text-white p-3 rounded-lg font-bold hover:bg-red-700 transition shadow-sm">
                        Влез
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;