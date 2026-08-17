import { useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка", description: "Грешен имейл или парола." });
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-orange-600">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Вход</CardTitle>
                    <CardDescription className="text-center">Влезте в профила си</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Имейл</Label>
                            <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Парола</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-red-700 text-white font-bold py-6">Влез</Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Нямате профил? <Link to="/register" className="text-orange-600 font-bold hover:underline">Регистрирайте се</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;