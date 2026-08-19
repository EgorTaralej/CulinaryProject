import { useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Грешка при вход",
                description: "Грешен имейл или парола. Опитайте отново."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <Card className="w-full max-w-[420px] shadow-2xl border-t-8 border-t-orange-500 rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="space-y-2 pt-10 pb-6 text-center">
                    <CardTitle className="text-3xl font-black text-slate-950 tracking-tight flex items-center justify-center gap-2">
                        <LogIn className="text-orange-500" size={28} /> Вход
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                        Влезте в профила си
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-6 px-8">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-slate-500 font-black uppercase text-[10px] ml-1 tracking-widest">
                                Имейл
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-orange-500 px-5 text-base font-medium shadow-inner"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-slate-500 font-black uppercase text-[10px] ml-1 tracking-widest">
                                Парола
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-orange-500 px-5 text-base font-medium shadow-inner"
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-6 pt-8 pb-10 px-8">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-slate-950 text-white font-black py-8 rounded-2xl text-lg shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] transition-all active:scale-95 border-none"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Влез'}
                        </Button>

                        <p className="text-sm text-center text-slate-400 font-bold">
                            Нямате профил? <Link to="/register" className="text-orange-600 hover:text-slate-950 underline-offset-4 transition-colors">Регистрирайте се</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;