import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            toast.success('Регистрацията е успешна!');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Грешка при регистрация');
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-red-600">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Създаване на профил</CardTitle>
                    <CardDescription className="text-center">
                        Станете част от нашата кулинарна общност
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Потребителско име</Label>
                            <Input 
                                id="username" 
                                type="text" 
                                placeholder="ChefEgor" 
                                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Имейл</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="name@example.com" 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Парола</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                required 
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-xl">
                            Регистрирай се
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Вече имате профил? <Link to="/login" className="text-red-600 font-bold hover:underline">Влезте тук</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Register;