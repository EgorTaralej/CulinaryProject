import { useLoaderData, useRevalidator, Link, redirect } from 'react-router-dom';
import api from '@/services/api';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, Check, X, Trash2, Ban, Mail, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export const adminLoader = async () => {
    try {
        const res = await api.get('/admin/dashboard');
        return res.data;
    } catch (err) {
        if (err.response && err.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return redirect('/login');
        }
        throw err;
    }
};

const AdminDashboard = () => {
    const data = useLoaderData();
    const revalidator = useRevalidator();
    const { toast } = useToast();

    const handleAction = async (url, method = 'put', successMsg) => {
        try {
            await api[method](url);
            toast({ title: successMsg });
            revalidator.revalidate();
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка при операцията" });
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            <div className="w-full flex items-center gap-6 mb-12 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="bg-orange-500 p-4 rounded-3xl shadow-xl shadow-orange-100 text-white flex-shrink-0">
                    <ShieldAlert size={40} />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none">Контролен панел</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] mt-2">Администрация на RecipeShare</p>
                </div>
            </div>

            <Tabs defaultValue="reports" className="flex flex-col w-full space-y-10">
                <div className="w-full border-b border-slate-100 pb-4">
                    <TabsList className="bg-slate-100/50 p-1.5 rounded-[1.5rem] h-auto border-none inline-flex w-fit shadow-none outline-none ring-0">
                        <TabsTrigger 
                            value="reports" 
                            className="rounded-[1.2rem] py-3 px-8 font-black text-base data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-lg transition-all outline-none ring-0 focus-visible:ring-0"
                        >
                            Сигнали ({data.reports.length})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="pending" 
                            className="rounded-[1.2rem] py-3 px-8 font-black text-base data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-lg transition-all outline-none ring-0 focus-visible:ring-0"
                        >
                            Нови рецепти ({data.pendingRecipes.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="reports" className="w-full space-y-8 outline-none animate-in fade-in duration-500">
                    {data.reports.map(report => (
                        <Card key={report._id} className="p-8 md:p-10 border-none shadow-2xl rounded-[3rem] bg-white relative overflow-hidden group w-full">
                            <div className="absolute top-0 left-0 w-full h-2 bg-red-500/10 group-hover:bg-red-500 transition-colors" />
                            
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                                {/* 1. АВТОР */}
                                <div className="flex flex-col">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Автор на рецептата
                                    </h4>
                                    <div className="flex items-center gap-4 mb-6">
                                        <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                                            <AvatarImage src={report.recipe?.author?.profileImage} />
                                            <AvatarFallback className="bg-slate-100 font-black">{report.recipe?.author?.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-black text-xl text-slate-900 truncate">{report.recipe?.author?.username}</p>
                                            <p className="text-xs text-slate-400 font-bold flex items-center gap-1 truncate italic">{report.recipe?.author?.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-auto">
                                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Рецепта:</p>
                                        <p className="font-black text-slate-900 line-clamp-1">{report.recipe?.title || "Изтрита рецепта"}</p>
                                        <Link to={`/recipe/${report.recipe?._id}`} className="text-orange-500 text-[10px] font-black uppercase hover:underline mt-2 flex items-center gap-1">
                                            <Eye size={12}/> Преглед
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex flex-col xl:border-x xl:border-slate-50 xl:px-10">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Подаден сигнал от
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                                            <AvatarImage src={report.reporter?.profileImage} />
                                            <AvatarFallback className="bg-slate-100 font-black">{report.reporter?.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-black text-xl text-slate-900 truncate">{report.reporter?.username}</p>
                                            <p className="text-xs text-slate-400 font-bold italic truncate">{report.reporter?.email}</p>
                                        </div>
                                    </div>
                                    <div className="mt-auto py-4">
                                        <p className="text-[10px] text-slate-300 font-bold uppercase italic italic">Сигналът изисква проверка на съдържанието</p>
                                    </div>
                                </div>

                                {/* 3. ДЕЙСТВИЯ */}
                                <div className="flex flex-col justify-center gap-3">
                                    <Button 
                                        onClick={() => handleAction(`/admin/recipe/${report.recipe?._id}`, 'delete', 'Рецептата е изтрита')} 
                                        className="w-full bg-red-500 hover:bg-slate-950 text-white font-black rounded-xl py-7 shadow-xl shadow-red-100 border-none transition-all active:scale-95"
                                    >
                                        <Trash2 className="mr-2" size={18}/> ИЗТРИЙ РЕЦЕПТАТА
                                    </Button>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button 
                                            onClick={() => handleAction(`/admin/user/${report.recipe?.author?._id}/block`, 'put', 'Статус променен')} 
                                            variant="outline" 
                                            className="border-slate-200 font-black text-[10px] uppercase text-slate-600 py-5 rounded-xl hover:bg-slate-950 hover:text-white transition-all shadow-none"
                                        >
                                            <Ban size={14} className="mr-1"/> Блок Автор
                                        </Button>
                                        <Button 
                                            onClick={() => handleAction(`/admin/user/${report.reporter?._id}/block`, 'put', 'Статус променен')} 
                                            variant="outline" 
                                            className="border-slate-200 font-black text-[10px] uppercase text-slate-600 py-5 rounded-xl hover:bg-slate-950 hover:text-white transition-all shadow-none"
                                        >
                                            <Ban size={14} className="mr-1"/> Блок Репортер
                                        </Button>
                                    </div>
                                    
                                    <Button 
                                        onClick={() => handleAction(`/admin/report/${report._id}/resolve`, 'put', 'Сигналът е архивиран')} 
                                        variant="ghost" 
                                        className="text-slate-300 font-black text-[10px] uppercase hover:bg-slate-50 py-3 rounded-lg shadow-none"
                                    >
                                        Игнорирай сигнала
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {data.reports.length === 0 && (
                        <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
                            <p className="text-slate-300 font-black text-2xl uppercase tracking-widest italic">Няма активни сигнали</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="pending" className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 outline-none animate-in fade-in duration-500">
                    {data.pendingRecipes.map(recipe => (
                        <Card key={recipe._id} className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white flex flex-col w-full group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-md flex-shrink-0">
                                        <AvatarImage src={recipe.author?.profileImage} />
                                        <AvatarFallback className="font-black text-lg">{recipe.author?.username?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-900 truncate">{recipe.author?.username}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase truncate italic">{recipe.author?.email}</p>
                                    </div>
                                </div>
                                <Link to={`/recipe/${recipe._id}`} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-orange-500 hover:text-white transition-all flex-shrink-0 shadow-sm">
                                    <Eye size={20} />
                                </Link>
                            </div>
                            <h3 className="text-xl font-black text-slate-950 mb-2 uppercase group-hover:text-orange-500 transition-colors tracking-tight line-clamp-1">{recipe.title}</h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-8 italic leading-relaxed">"{recipe.description}"</p>
                            
                            <div className="flex gap-3 pt-6 border-t border-slate-50 mt-auto">
                                <Button 
                                    onClick={() => handleAction(`/admin/recipe/${recipe._id}/approve`, 'put', 'Рецептата е одобрена!')} 
                                    className="flex-1 bg-emerald-500 hover:bg-slate-950 text-white font-black rounded-xl py-6 shadow-xl shadow-emerald-50 border-none transition-all active:scale-95"
                                >
                                    <Check className="mr-2" size={18} /> ОДОБРИ
                                </Button>
                                <Button 
                                    onClick={() => handleAction(`/admin/recipe/${recipe._id}`, 'delete', 'Рецептата е изтрита')} 
                                    className="bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 font-black rounded-xl py-6 px-6 transition-all border-none shadow-none"
                                >
                                    <X size={18} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {data.pendingRecipes.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
                            <p className="text-slate-300 font-black text-2xl uppercase tracking-widest italic">Няма нови рецепти за преглед</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;