import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            toast({
                title: "Успешна регистрация!",
                description: "Вече можете да влезете в профила си.",
            });
            navigate('/login');
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Грешка при регистрация",
                description: err.response?.data?.message || "Нещо се обърка. Моля, опитайте пак.",
            });
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-orange-600">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Регистрация</CardTitle>
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
                                autoComplete="off"
                                placeholder="ChefEgor"
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Имейл</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="name@example.com"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Парола</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-red-700 text-white font-bold py-6 rounded-xl">
                            Регистрирай се
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Вече имате профил? <Link to="/login" className="text-orange-600 font-bold hover:underline">Влезте тук</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Register;