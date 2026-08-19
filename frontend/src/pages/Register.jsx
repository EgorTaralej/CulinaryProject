import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast({
                title: "Успешна регистрация!",
                description: "Добре дошли! Вече можете да влезете в профила си.",
            });
            navigate('/login');
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Грешка при регистрация",
                description: err.response?.data?.message || "Нещо се обърка. Моля, опитайте пак.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[85vh] items-center justify-center px-4 py-10">
            <Card className="w-full max-w-[420px] shadow-2xl border-t-8 border-t-orange-500 rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="space-y-2 pt-10 pb-6 text-center">
                    <CardTitle className="text-3xl font-black text-slate-950 tracking-tight flex items-center justify-center gap-2">
                        <UserPlus className="text-orange-500" size={28} /> Регистрация
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-bold uppercase text-xs tracking-widest px-4">
                        Станете част от нашата кулинарна общност
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-5 px-8">
                        <div className="grid gap-2">
                            <Label htmlFor="username" className="text-slate-500 font-black uppercase text-[10px] ml-1 tracking-widest">
                                Потребителско име
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                autoComplete="off"
                                className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-orange-500 px-5 text-base font-medium shadow-inner"
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-slate-500 font-black uppercase text-[10px] ml-1 tracking-widest">
                                Имейл
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-orange-500 px-5 text-base font-medium shadow-inner"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-slate-500 font-black uppercase text-[10px] ml-1 tracking-widest">
                                Парола
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-orange-500 px-5 text-base font-medium shadow-inner"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-6 pt-8 pb-10 px-8">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-slate-950 text-white font-black py-8 rounded-2xl text-lg shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] transition-all active:scale-95 border-none"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Регистрирай се'}
                        </Button>

                        <p className="text-sm text-center text-slate-400 font-bold">
                            Вече имате профил? <Link to="/login" className="text-orange-600 hover:text-slate-950 underline-offset-4 transition-colors">Влезте тук</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Register;