import { useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('Добре дошли отново!');
            navigate('/');
        } catch (err) {
            toast.error('Грешен имейл или парола');
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-red-600">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Вход в RecipeShare</CardTitle>
                    <CardDescription className="text-center">
                        Въведете данните си, за да влезете в профила си
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Имейл</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="name@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Парола</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-xl">
                            Влез
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Нямате профил? <Link to="/register" className="text-red-600 font-bold hover:underline">Регистрирайте се</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;