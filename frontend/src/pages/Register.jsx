import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            alert('Регистрацията е успешна! Сега можете да влезете.');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || 'Грешка при регистрация');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 shadow-lg rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Регистрация</h2>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Потребителско име" 
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        required
                    />
                    <input 
                        type="email" 
                        placeholder="Имейл" 
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Парола" 
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                    />
                    <button className="w-full bg-red-500 text-white p-3 rounded-lg font-bold hover:bg-red-600 transition">
                        Регистрирай се
                    </button>
                    <p className="text-center text-sm text-gray-600">
                        Вече имате профил? <Link to="/login" className="text-red-500 hover:underline">Влезте тук</Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Register;