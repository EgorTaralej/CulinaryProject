import { useState } from 'react';
import { useLoaderData, useRevalidator, Link, redirect } from 'react-router-dom';
import api from '@/services/api';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, Check, X, Trash2, Ban, Mail, Eye, Archive, CheckCircle2, History, UserCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from '@/components/ConfirmationDialog';

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

    const [confirmData, setConfirmData] = useState({
        isOpen: false,
        type: '',
        url: '',
        method: 'put',
        msg: '',
        body: {},
        title: '',
        desc: '',
        confirmText: 'Изтрий'
    });

    const triggerConfirm = (type, url, method, msg, body = {}, title, desc, confirmText = "Изтрий") => {
        setConfirmData({ isOpen: true, type, url, method, msg, body, title, desc, confirmText });
    };

    const handleConfirmAction = async () => {
        try {
            await api[confirmData.method](confirmData.url, confirmData.body);
            toast({ title: confirmData.msg });
            revalidator.revalidate();
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка при операцията" });
        } finally {
            setConfirmData({ ...confirmData, isOpen: false });
        }
    };

    const handleDirectAction = async (url, method = 'put', successMsg, body = {}) => {
        try {
            await api[method](url, body);
            toast({ title: successMsg });
            revalidator.revalidate();
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка при операцията" });
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 text-slate-950 font-sans">
            <div className="w-full flex items-center gap-4 md:gap-6 mb-8 md:mb-12 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="bg-orange-500 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl shadow-orange-100 text-white flex-shrink-0">
                    <ShieldAlert className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-5xl font-black tracking-tighter leading-none">Админ панел</h1>
                    <p className="text-slate-400 font-bold uppercase text-[8px] md:text-xs tracking-[0.2em] mt-1 md:mt-2 italic">Администрация на RecipeShare</p>
                </div>
            </div>

            <Tabs defaultValue="reports" className="flex flex-col w-full">
                <div className="w-full border-b border-slate-100 pb-4 mb-8 md:mb-10">
                    <TabsList className="w-full max-w-4xl md:mx-auto grid grid-cols-2 md:grid-cols-4 bg-slate-100/50 p-1.5 rounded-[1.5rem] md:rounded-[2rem] h-auto border-none gap-1.5 md:gap-0">
                        <TabsTrigger
                            value="reports"
                            className="rounded-[1.1rem] md:rounded-[1.2rem] py-3 px-2 md:px-8 font-black text-[13px] md:text-base data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-lg transition-all outline-none"
                        >
                            Сигнали ({data.reports.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="pending"
                            className="rounded-[1.1rem] md:rounded-[1.2rem] py-3 px-2 md:px-8 font-black text-[13px] md:text-base data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-lg transition-all outline-none"
                        >
                            Нови ({data.pendingRecipes.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="updates"
                            className="rounded-[1.1rem] md:rounded-[1.2rem] py-3 px-2 md:px-8 font-black text-[13px] md:text-base data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-lg transition-all outline-none"
                        >
                            Промени ({data.recipesWithUpdates?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger
                            value="blocked"
                            className="rounded-[1.1rem] md:rounded-[1.2rem] py-3 px-2 md:px-8 font-black text-[13px] md:text-base data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-lg transition-all outline-none"
                        >
                            Блокирани ({data.blockedUsers?.length || 0})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="reports" className="w-full space-y-8 outline-none">
                    {data.reports.map(report => {
                        const isRecipeDeleted = !report.recipe;
                        const isAuthorDeleted = !report.recipe?.author;
                        const hasActionBeenTaken = isRecipeDeleted || isAuthorDeleted;

                        const displayTitle = report.recipe?.pendingUpdates?.title || report.recipe?.title;

                        return (
                            <Card key={report._id} className={`p-8 md:p-10 border-none shadow-2xl rounded-[3rem] bg-white relative overflow-hidden group w-full ${hasActionBeenTaken ? 'opacity-90' : ''}`}>
                                <div className={`absolute top-0 left-0 w-full h-2 ${hasActionBeenTaken ? 'bg-emerald-500' : 'bg-red-500/10 group-hover:bg-red-500'} transition-colors`} />

                                <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                                    <div className="flex flex-col xl:col-span-2">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Автор на рецептата
                                        </h4>
                                        <div className="flex items-center gap-4 mb-6">
                                            <Link to={`/profile/${report.recipe?.author?._id}`} className="flex items-center gap-4 group/author">
                                                <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                                                    <AvatarImage src={report.recipe?.author?.profileImage} />
                                                    <AvatarFallback className="bg-slate-100 font-black">{isAuthorDeleted ? '?' : report.recipe?.author?.username?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className={`font-black text-xl truncate group-hover/author:text-orange-500 transition-colors ${isAuthorDeleted ? 'text-slate-400 italic' : (report.recipe?.author?.isBlocked ? 'text-red-500' : 'text-slate-900')}`}>{isAuthorDeleted ? "Авторът е премахнат" : report.recipe?.author?.username} {report.recipe?.author?.isBlocked && <span className="font-black">[БЛОКИРАН]</span>}</p>
                                                    {!isAuthorDeleted && <p className="text-xs text-slate-400 font-bold flex items-center gap-1 truncate italic">{report.recipe?.author?.email}</p>}
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-auto font-bold flex-1 flex flex-col justify-center">
                                            <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest italic">Рецепта:</p>
                                            <p className={`font-black text-lg ${isRecipeDeleted ? 'text-slate-400 italic' : 'text-slate-900'}`}>{isRecipeDeleted ? "Рецептата е изтрита" : displayTitle}</p>
                                            {!isRecipeDeleted && <Link to={`/recipe/${report.recipe?._id}`} className="text-orange-500 text-[10px] font-black uppercase hover:underline mt-2 flex items-center gap-1"><Eye size={12} /> Преглед</Link>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col xl:border-x xl:border-slate-50 xl:px-10">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Подаден сигнал от
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            <Link to={`/profile/${report.reporter?._id}`} className="flex items-center gap-4 group/reporter">
                                                <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                                                    <AvatarImage src={report.reporter?.profileImage} />
                                                    <AvatarFallback className="bg-slate-100 font-black">{report.reporter?.username?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-black text-xl group-hover/reporter:text-orange-500 transition-colors truncate">{report.reporter?.username}</p>
                                                    <p className="text-xs text-slate-400 font-bold italic truncate">{report.reporter?.email}</p>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center gap-4">
                                        <Button
                                            disabled={isRecipeDeleted}
                                            onClick={() => triggerConfirm('delete', `/admin/recipe/${report.recipe?._id}`, 'delete', 'Рецептата е изтрита', {}, 'Изтриване на рецепта', 'Наистина ли искате да премахнете тази рецепта?')}
                                            className="w-full bg-red-500 hover:bg-slate-950 text-white font-black rounded-xl py-7 shadow-xl shadow-red-100 border-none transition-all disabled:bg-slate-300 disabled:text-slate-600 disabled:opacity-100 disabled:cursor-not-allowed disabled:shadow-none"
                                        >
                                            <Trash2 className="mr-2" size={18} />
                                            {isRecipeDeleted ? "РЕЦЕПТАТА Е ИЗТРИТА" : "ИЗТРИЙ РЕЦЕПТАТА"}
                                        </Button>

                                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                                            <Button
                                                disabled={isAuthorDeleted || report.recipe?.author?.isBlocked}
                                                onClick={() => triggerConfirm('block', `/admin/user/${report.recipe?.author?._id}/block`, 'put', 'Авторът е блокиран', { reportId: report._id }, 'Блокиране на автор', 'Това ще изтрие всички негови рецепти и коментари!', 'Блокирай')}
                                                variant="outline"
                                                className="flex-1 flex items-center justify-center gap-1 md:gap-2 border-slate-200 font-black text-[8px] md:text-[10px] uppercase text-slate-600 py-5 rounded-xl hover:bg-slate-950 hover:text-white transition-all shadow-none"
                                            >
                                                <Ban size={12} className="shrink-0" />
                                                <span className="whitespace-nowrap">{report.recipe?.author?.isBlocked ? "Блокиран" : "Блок Автор"}</span>
                                            </Button>

                                            <Button
                                                onClick={() => triggerConfirm('block', `/admin/user/${report.reporter?._id}/block`, 'put', 'Репортерът е блокиран', {}, 'Блокиране на репортер', 'Сигурни ли сте, че искате да блокирате този потребител?', 'Блокирай')}
                                                variant="outline"
                                                className="flex-1 flex items-center justify-center gap-1 md:gap-2 border-slate-200 font-black text-[8px] md:text-[10px] uppercase text-slate-600 py-5 rounded-xl hover:bg-slate-950 hover:text-white transition-all shadow-none"
                                            >
                                                <Ban size={12} className="shrink-0" />
                                                <span className="whitespace-nowrap">Блок Репортер</span>
                                            </Button>
                                        </div>

                                        <Button
                                            onClick={() => triggerConfirm(
                                                'resolve',
                                                `/admin/report/${report._id}/resolve`,
                                                'put',
                                                hasActionBeenTaken ? 'Случаят е приключен' : 'Сигналът е архивиран',
                                                {},
                                                hasActionBeenTaken ? 'Архивиране на сигнал' : 'Игнориране на сигнал',
                                                hasActionBeenTaken
                                                    ? 'Случаят е обработен. Искате ли да премахнете този сигнал от списъка?'
                                                    : 'Сигурни ли сте, че искате да игнорирате този сигнал без да предприемате мерки?',
                                                hasActionBeenTaken ? "Отказ" : "Игнорирай"
                                            )}
                                            className={`w-full font-black text-[11px] uppercase py-7 rounded-xl transition-all border-none shadow-none ${hasActionBeenTaken
                                                ? "bg-emerald-500 text-white hover:bg-slate-950 shadow-lg shadow-emerald-100"
                                                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                                }`}
                                        >
                                            {hasActionBeenTaken ? (
                                                <><CheckCircle2 size={18} className="mr-2" /> Затвори приключения сигнал</>
                                            ) : (
                                                <><Archive size={18} className="mr-2" /> Игнорирай и архивирай</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                    {data.reports.length === 0 && (
                        <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
                            <p className="text-slate-300 font-black text-2xl uppercase tracking-widest italic">Няма активни сигнали</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="pending" className="w-full outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {data.pendingRecipes.map(recipe => (
                            <Card key={recipe._id} className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white flex flex-col w-full group">
                                <div className="flex justify-between items-start mb-6">
                                    <Link to={`/profile/${recipe.author?._id}`} className="flex items-center gap-3 min-w-0 group/author">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-md flex-shrink-0">
                                            <AvatarImage src={recipe.author?.profileImage} />
                                            <AvatarFallback className="font-black text-lg">{recipe.author?.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className={`font-black group-hover/author:text-orange-500 transition-colors truncate ${recipe.author?.isBlocked ? "text-red-500" : "text-slate-900"}`}>
                                                {recipe.author?.username} {recipe.author?.isBlocked && "[БЛОКИРАН]"}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase truncate italic">{recipe.author?.email}</p>
                                        </div>
                                    </Link>
                                    <Link to={`/recipe/${recipe._id}`} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-orange-500 hover:text-white transition-all flex-shrink-0 shadow-sm">
                                        <Eye size={20} />
                                    </Link>
                                </div>
                                <h3 className="text-[17px] font-bold text-slate-800 leading-tight line-clamp-2 italic">{recipe.pendingUpdates?.title || recipe.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-8 italic">"{recipe.pendingUpdates?.description || recipe.description}"</p>
                                <div className="flex gap-3 pt-6 border-t border-slate-50 mt-auto">
                                    <Button
                                        onClick={() => triggerConfirm(
                                            'approve',
                                            `/admin/recipe/${recipe._id}/approve`,
                                            'put',
                                            'Рецептата е одобрена!',
                                            {},
                                            'Одобряване на рецепта',
                                            `Сигурни ли сте, че искате да одобрите "${recipe.pendingUpdates?.title || recipe.title}"? Тя ще стане публично видима за всички потребители.`,
                                            'Одобри'
                                        )}
                                        className="flex-1 bg-emerald-500 hover:bg-slate-950 text-white font-black rounded-xl py-6 shadow-xl shadow-emerald-50 border-none transition-all active:scale-95"
                                    >
                                        <Check className="mr-2" size={18} /> ОДОБРИ
                                    </Button>
                                    <Button onClick={() => triggerConfirm('delete', `/admin/recipe/${recipe._id}`, 'delete', 'Рецептата е изтрита.', {}, 'Изтрий', `Сигурни ли сте, че искате да отклоните "${recipe.title}"?`)} className="bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 rounded-xl py-6 px-6 transition-all border-none">
                                        <X size={18} />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                    {data.pendingRecipes.length === 0 && (
                        <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
                            <p className="text-slate-300 font-black text-2xl uppercase italic">Няма нови рецепти</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="updates" className="w-full outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {data.recipesWithUpdates?.map(recipe => {
                            const displayTitle = recipe.pendingUpdates?.title || recipe.title;
                            const displayDescription = recipe.pendingUpdates?.description || recipe.description;

                            return (
                                <Card key={recipe._id} className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white flex flex-col w-full group font-sans">
                                    <div className="flex justify-between items-start mb-6 font-sans">
                                        <Link to={`/profile/${recipe.author?._id}`} className="flex items-center gap-3 min-w-0 group/author">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-md flex-shrink-0">
                                                <AvatarImage src={recipe.author?.profileImage} />
                                                <AvatarFallback className="font-black text-lg">{recipe.author?.username?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 font-sans">
                                                <p className={`font-black group-hover/author:text-orange-500 transition-colors truncate ${recipe.author?.isBlocked ? "text-red-500" : "text-slate-900"}`}>
                                                    {recipe.author?.username} {recipe.author?.isBlocked && "[БЛОКИРАН]"}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase truncate italic tracking-widest font-sans">{recipe.author?.email}</p>
                                            </div>
                                        </Link>
                                        <Link to={`/recipe/${recipe._id}`} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-orange-500 hover:text-white transition-all flex-shrink-0 shadow-sm">
                                            <Eye size={20} />
                                        </Link>
                                    </div>
                                    <h3 className="text-[17px] font-bold text-slate-800 leading-tight line-clamp-2 break-all overflow-wrap-anywhere font-sans italic">
                                        {displayTitle}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-8 italic leading-relaxed font-sans">
                                        "{displayDescription}"
                                    </p>
                                    <div className="flex gap-3 pt-6 border-t border-slate-50 mt-auto">
                                        <Button onClick={() => triggerConfirm('approve', `/admin/recipe/${recipe._id}/approve`, 'put', 'Приложено!', {}, 'Одобри промени', 'Сигурни ли сте, че искате да одобрите промените?', 'Приложи')} className="flex-1 bg-emerald-500 hover:bg-slate-950 text-white font-black rounded-xl py-6 transition-all active:scale-95 text-xs uppercase border-none shadow-xl shadow-emerald-50">
                                            <Check className="mr-2" size={18} /> ПРИЛОЖИ
                                        </Button>
                                        <Button onClick={() => triggerConfirm('reject', `/admin/recipe/${recipe._id}/reject-update`, 'put', 'Отхвърлени', {}, 'Отказ', 'Сигурни ли сте, че искате да отклоните промените?')} className="bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 rounded-xl py-6 px-6 transition-all text-xs uppercase border-none">
                                            <X size={18} />
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                    {data.recipesWithUpdates?.length === 0 && (
                        <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
                            <p className="text-slate-300 font-black text-2xl uppercase italic">Няма чакащи редакции</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="blocked" className="w-full outline-none font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {data.blockedUsers?.map(user => (
                            <Card key={user._id} className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white flex flex-col w-full group">
                                <div className="flex justify-between items-start mb-2">
                                    <Link to={`/profile/${user._id}`} className="flex items-center gap-3 min-w-0 group/user">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-md flex-shrink-0">
                                            <AvatarImage src={user.profileImage} />
                                            <AvatarFallback className="font-black text-lg">{user.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-black group-hover:text-orange-500 transition-colors truncate">{user.username}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase truncate italic">{user.email}</p>
                                        </div>
                                    </Link>
                                </div>
                                <div className="flex gap-3 pt-6 border-t border-slate-50 mt-auto">
                                    <Button
                                        onClick={() => triggerConfirm('unblock', `/admin/user/${user._id}/unblock`, 'put', 'Разблокиран!', {}, 'Разблокиране', `Сигурни ли сте, че искате да върнете достъпа на ${user.username} към профила му?`, 'Разблокирай')}
                                        className="flex-1 bg-emerald-500 hover:bg-slate-950 text-white font-black rounded-xl py-6 transition-all active:scale-95 shadow-xl shadow-emerald-100 border-none"
                                    >
                                        <UserCheck className="mr-2" size={18} /> РАЗБЛОКИРАЙ
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                    {data.blockedUsers?.length === 0 && (
                        <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
                            <p className="text-slate-300 font-black text-2xl uppercase italic">Няма блокирани потребители</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <ConfirmationDialog
                isOpen={confirmData.isOpen}
                onOpenChange={(open) => setConfirmData({ ...confirmData, isOpen: open })}
                onConfirm={handleConfirmAction}
                title={confirmData.title}
                description={confirmData.desc}
                confirmText={confirmData.confirmText}
            />
        </div>
    );
};

export default AdminDashboard;