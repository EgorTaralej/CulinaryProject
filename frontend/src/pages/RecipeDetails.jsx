import { useState, useContext, useMemo } from 'react';
import { useNavigate, useLoaderData, Link } from 'react-router-dom';
import api from '@/services/api';
import { AuthContext } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Send, PlayCircle, Utensils, Heart, Clock, Users, AlertCircle, X, Trash2, Pen, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from '@/components/ConfirmationDialog';

export const recipeLoader = async ({ params }) => {
    try {
        const res = await api.get(`/recipes/${params.id}`);
        return res.data;
    } catch (err) {
        return { recipe: null, comments: [] };
    }
};

const RecipeDetails = () => {
    const { recipe: initialRecipe, comments: initialComments } = useLoaderData();
    const { toast } = useToast();
    const { user, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState(initialRecipe);
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [confirmData, setConfirmState] = useState({
        isOpen: false,
        type: '',
        data: null
    });

    const existingRating = recipe?.ratings?.find(r => (r.user._id || r.user) === user?.id);
    const [userRating, setUserRating] = useState(existingRating?.stars || 0);

    const isAuthor = user?.id === recipe?.author?._id;

    const isFavorite = useMemo(() => {
        return user?.favorites?.some(fav => (fav._id || fav) === recipe?._id);
    }, [user?.favorites, recipe?._id]);

    const publishDate = recipe ? new Date(recipe.createdAt).toLocaleDateString('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) : "";

    const updateDate = recipe ? new Date(recipe.updatedAt).toLocaleDateString('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) : "";

    if (!recipe || !recipe.title) {
        return (
            <div className="max-w-4xl mx-auto py-32 text-center">
                <h1 className="text-3xl font-black text-slate-300 uppercase tracking-tighter">Тази рецепта е недостъпна</h1>
                <Link to="/" className="text-slate-600 hover:text-orange-500 transition-colors font-bold text-sm mt-4 inline-block">Върни се в началото</Link>
            </div>
        );
    }

    const executeAction = async () => {
        const { type, data } = confirmData;
        try {
            if (type === 'deleteRecipe') {
                const url = user.role === 'admin' ? `/admin/recipe/${recipe._id}` : `/recipes/${recipe._id}`;
                await api.delete(url);
                toast({ title: "Рецептата е изтрита успешно." });
                navigate('/profile');
            } else if (type === 'blockUser') {
                await api.put(`/admin/user/${data.id}/block`);
                toast({ title: `Потребителят ${data.username} е блокиран.` });
                if (data.id === recipe.author._id.toString() || data.id === recipe.author._id) {
                    setRecipe(prev => ({ ...prev, author: { ...prev.author, isBlocked: true } }));
                }
                setComments(prev => prev.map(c =>
                    (c.author._id === data.id) ? { ...c, author: { ...c.author, isBlocked: true } } : c
                ));
            } else if (type === 'deleteComment') {
                const url = user.role === 'admin' ? `/admin/comment/${data}` : `/recipes/comment/${data}`;
                await api.delete(url);
                setComments(prev => prev.filter(c => c._id !== data));
                toast({ title: "Коментарът е премахнат." });
            } else if (type === 'rejectUpdate') {
                await api.put(`/admin/recipe/${recipe._id}/reject-update`);
                setRecipe({ ...recipe, hasPendingUpdates: false, pendingUpdates: null });
                toast({ title: "Промените бяха отхвърлени." });
            } else if (type === 'approveRecipe') {
                await api.put(`/admin/recipe/${recipe._id}/approve`);
                if (recipe.hasPendingUpdates) {
                    window.location.reload();
                } else {
                    setRecipe({ ...recipe, status: 'approved' });
                    toast({ title: "Рецептата е одобрена успешно!" });
                }
            }
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка при операцията" });
        }
        setConfirmState({ isOpen: false, type: '', data: null });
    };

    const handleUpdateComment = async (id) => {
        if (!editCommentText.trim()) return;
        try {
            await api.put(`/recipes/comment/${id}`, { text: editCommentText });
            setComments(comments.map(c => c._id === id ? { ...c, text: editCommentText } : c));
            setEditingCommentId(null);
            toast({ title: "Коментарът е обновен!" });
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка при редакцията" });
        }
    };

    const handleApprove = () => {
        setConfirmState({
            isOpen: true,
            type: 'approveRecipe',
            data: null
        });
    };

    const handleToggleFavorite = async () => {
        if (!user) return navigate('/login');
        try {
            await api.put(`/users/favorite/${recipe._id}`);
            await refreshUser();

            toast({
                title: !isFavorite ? "Запазена в любими!" : "Премахната от любими.",
                duration: 2000
            });
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка" });
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/recipes/${recipe._id}/comment`, { text: newComment });
            setComments([res.data, ...comments]);
            setNewComment('');
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка при коментиране" });
        }
    };

    const handleRate = async (stars) => {
        if (!user) return navigate('/login');
        if (isAuthor) return;
        try {
            const res = await api.post(`/recipes/${recipe._id}/rate`, { stars });
            setRecipe({
                ...recipe,
                averageRating: res.data.averageRating,
                ratings: res.data.ratings
            });
            setUserRating(stars);
            toast({ title: "Оценката е приета!" });
        } catch (err) { toast({ variant: "destructive", title: "Грешка" }); }
    };

    const isUpdated = recipe && recipe.createdAt !== recipe.updatedAt;

    const videoId = useMemo(() => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = recipe.videoUrl?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }, [recipe.videoUrl]);

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 font-sans">

            {user?.role === 'admin' && user?.id !== recipe.author._id && (
                <div className="bg-red-50 border border-red-100 p-5 rounded-[2rem] mb-10 flex flex-wrap gap-4 items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 text-red-600 font-black uppercase text-xs tracking-widest italic">
                        <AlertCircle size={18} /> Админ Контрол
                    </div>
                    <div className="flex gap-2">
                        {(recipe.status !== 'approved' || recipe.hasPendingUpdates) && (
                            <Button onClick={handleApprove} variant="outline" className="font-bold rounded-xl border-emerald-200 text-emerald-500 hover:bg-emerald-500 hover:text-white">
                                {recipe.hasPendingUpdates ? "Приложи промените" : "Одобри рецептата"}
                            </Button>
                        )}

                        {recipe.hasPendingUpdates && (
                            <Button
                                onClick={() => setConfirmState({ isOpen: true, type: 'rejectUpdate' })}
                                variant="outline"
                                className="font-bold rounded-xl border-orange-200 text-orange-500 hover:bg-orange-500 hover:text-white"
                            >
                                Отклони промените
                            </Button>
                        )}
                        <Button onClick={() => setConfirmState({ isOpen: true, type: 'deleteRecipe' })} variant="outline" className="font-bold rounded-xl hover:bg-slate-900 hover:text-white">Изтрий рецептата</Button>
                        <Button
                            disabled={recipe.author.isBlocked}
                            onClick={() => setConfirmState({ isOpen: true, type: 'blockUser', data: { id: recipe.author._id, username: recipe.author.username } })}
                            variant="outline"
                            className="font-bold rounded-xl border-red-200 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                        >
                            {recipe.author.isBlocked ? "Авторът е блокиран" : "Блокирай автора"}
                        </Button>
                    </div>
                </div>
            )}

            {isAuthor && (recipe.status === 'pending' || recipe.hasPendingUpdates) && (
                <div className="bg-orange-50 border-2 border-dashed border-orange-200 p-6 rounded-[2rem] mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-2 rounded-full text-white"><Clock size={20} /></div>
                        <div>
                            <p className="font-black text-orange-700 uppercase text-xs tracking-widest">
                                В процес на одобрение
                            </p>
                            <p className="text-orange-600 text-sm font-medium">
                                {recipe.hasPendingUpdates
                                    ? "Вашите нови промени се преглеждат от администратор."
                                    : "Вашата рецепта се преглежда от администратор. Можете да я редактирате по всяко време."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                    {recipe.mainImage ? <img src={recipe.mainImage} className="w-full h-full object-cover" alt={recipe.title} /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic">Няма снимка</div>}
                </div>

                <div className="flex flex-col space-y-6">
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl md:text-5xl font-black text-slate-950 leading-[1.1] break-words whitespace-normal flex-1 mr-4">
                            {recipe.title}
                        </h1>
                        <Button
                            type="button"
                            onClick={handleToggleFavorite}
                            variant="ghost"
                            className={`rounded-full w-14 h-14 p-0 transition-all border-2 shrink-0 ${isFavorite
                                ? 'text-orange-500 border-orange-500 bg-orange-50'
                                : 'text-slate-950 border-slate-200 bg-white hover:border-orange-500'
                                }`}
                        >
                            <Heart fill={isFavorite ? "currentColor" : "none"} size={28} strokeWidth={2.5} />
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1 text-amber-500 font-black text-xl">
                            <Star fill="currentColor" size={24} /> {recipe.averageRating.toFixed(1)}
                            <span className="text-sm text-slate-300 ml-1">({recipe.ratings?.length || 0})</span>
                        </div>
                        <Separator orientation="vertical" className="h-6 bg-slate-200 hidden sm:block" />
                        <Link to={`/profile/${recipe.author._id}`} className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-orange-500 transition-colors">
                            <Avatar className="w-6 h-6 border border-slate-100">
                                <AvatarImage src={recipe.author.profileImage} />
                                <AvatarFallback className="text-[10px] bg-orange-100 text-orange-600">{recipe.author.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className={recipe.author.isBlocked ? "text-red-500 font-black" : ""}>
                                {recipe.author.username} {recipe.author.isBlocked && "[БЛОКИРАН]"}
                            </span>
                        </Link>
                        <Separator orientation="vertical" className="h-6 bg-slate-200 hidden sm:block" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-400 font-bold uppercase text-[11px] tracking-tight">
                                Създадена: {publishDate}
                            </span>
                            {isUpdated && (
                                <span className="text-slate-400 font-bold uppercase text-[11px] tracking-tight">
                                    Последна промяна: {updateDate}
                                </span>
                            )}
                        </div>
                    </div>

                    {isAuthor && (
                        <div className="flex gap-3 mt-2">

                            <Link
                                to={`/recipe/${recipe._id}/edit`}
                                className="w-fit flex items-center gap-2 bg-slate-950 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-500 transition-colors shadow-lg"
                            >
                                <Pen size={16} className="rotate-180" />
                                <span>Редактирай рецептата</span>
                            </Link>

                            <Button
                                onClick={() => setConfirmState({ isOpen: true, type: 'deleteRecipe' })}
                                className="w-fit border-slate-200 flex items-center gap-2 bg-slate-950 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-500 transition-colors shadow-lg h-auto"
                            >
                                <Trash2 size={14} className="mr-1" />
                                <span>Изтрий рецепта</span>
                            </Button>
                        </div>

                    )}

                    <div className="flex flex-wrap gap-3 mb-2">
                        <div className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {recipe.category?.dishType}
                        </div>
                        <div className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {recipe.category?.cuisine}
                        </div>
                        <div className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {recipe.category?.difficulty}
                        </div>
                    </div>
                    <p className="text-xl text-slate-500 leading-relaxed border-l-4 border-orange-400 pl-6 italic">{recipe.description}</p>

                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-slate-900 font-black text-sm uppercase tracking-tight flex items-center gap-1.5">
                                    <Clock size={16} className="text-orange-500" /> Подготовка
                                </p>
                                <p className="text-slate-500 font-bold text-lg">{recipe.prepTime || "0"} мин.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-900 font-black text-sm uppercase tracking-tight flex items-center gap-1.5">
                                    <Clock size={16} className="text-orange-500" /> Готвене
                                </p>
                                <p className="text-slate-500 font-bold text-lg">{recipe.cookTime || "0"} мин.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-900 font-black text-sm uppercase tracking-tight flex items-center gap-1.5">
                                    <Users size={16} className="text-orange-500" /> Порции
                                </p>
                                <p className="text-slate-500 font-bold text-lg">{recipe.servings || "1"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                {isAuthor ? "Не можете да оценявате собствена рецепта" : "Вашата оценка"}
                            </p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRate(star)}
                                        disabled={isAuthor}
                                        className={`p-2 rounded-xl transition-all ${userRating >= star ? 'text-orange-500 bg-orange-50' : 'text-slate-300 bg-slate-50'}`}
                                    >
                                        <Star size={28} fill={userRating >= star ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        {user?.role !== 'admin' && (
                            <button
                                onClick={() => setIsReportOpen(true)}
                                className="text-slate-400 hover:text-red-500 text-xs font-bold flex items-center gap-1 transition-colors self-end pb-2"
                            >
                                <AlertCircle size={14} /> Докладвай
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-start">
                <div className="lg:col-span-2 space-y-12">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3"><Utensils className="text-orange-500" /> Инструкции</h2>
                    <div className="space-y-10">
                        {recipe.steps.map((step, i) => (
                            <div key={i} className="relative pl-14 space-y-6">
                                <div className="absolute left-0 top-0 w-10 h-10 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">{i + 1}</div>
                                <div className="space-y-4">
                                    <p className="text-xl text-slate-700 leading-relaxed font-medium">{step.text}</p>
                                    {step.image && <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-xl max-w-lg"><img src={step.image} className="w-full object-cover" alt={`Стъпка ${i + 1}`} /></div>}
                                </div>
                            </div>
                        ))}
                    </div>
                    {videoId && (
                        <div className="pt-10 space-y-6">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2"><PlayCircle className="text-orange-500" /> Видео урок</h3>
                            <div className="aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}`} allowFullScreen title="Recipe Video"></iframe>
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <Card className="p-8 rounded-[2.5rem] shadow-xl border-none bg-white sticky top-24">
                        <h3 className="text-2xl font-black text-slate-900 mb-8 border-b-4 border-orange-500 pb-2 w-fit">Съставки</h3>
                        <ul className="space-y-5">
                            {recipe.ingredients.map((ing, i) => (
                                <li key={i} className="text-lg text-slate-600 flex items-start gap-3 group">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2.5 group-hover:scale-150 transition-transform" />
                                    <span className="font-medium">{ing}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>

            <Separator className="my-16 bg-slate-100" />

            <div className="max-w-3xl mx-auto space-y-12">
                <h2 className="text-3xl font-black text-slate-950">Коментари <span className="text-orange-500">({comments.length})</span></h2>

                {user && !recipe.author.isBlocked ? (
                    <form onSubmit={handleAddComment} className="relative group">
                        <Textarea
                            placeholder="Споделете вашето мнение..."
                            className="rounded-[2rem] p-8 pr-20 bg-white shadow-2xl border-none text-lg focus-visible:ring-2 focus-visible:ring-orange-500 min-h-[140px] transition-all resize-none shadow-inner font-medium"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button
                            type="submit"
                            className="absolute bottom-6 right-6 bg-orange-500 hover:bg-slate-950 text-white rounded-2xl w-14 h-14 p-0 shadow-lg shadow-orange-200 transition-all active:scale-90 border-none">
                            <Send size={24} />
                        </Button>
                    </form>
                ) : (
                    recipe.author.isBlocked && <p className="text-center text-slate-400 italic font-bold">Коментарите за тази рецепта са деактивирани.</p>
                )}

                <div className="space-y-6">
                    {comments
                        .filter(c => user?.role === 'admin' || !c.author.isBlocked)
                        .map((c) => {
                            const isCommentAuthor = user?.id === (c.author._id || c.author);
                            const canDelete = user?.role === 'admin' || isCommentAuthor;
                            const isEditing = editingCommentId === c._id;

                            return (
                                <div key={c._id} className="relative bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 flex gap-6 hover:shadow-md transition-shadow">
                                    <div className="absolute top-6 right-6 flex gap-3">
                                        {isCommentAuthor && !isEditing && (
                                            <button onClick={() => { setEditingCommentId(c._id); setEditCommentText(c.text); }} className="text-slate-200 hover:text-orange-500 transition-colors">
                                                <Pen size={18} />
                                            </button>
                                        )}
                                        {canDelete && !isEditing && (
                                            <button onClick={() => setConfirmState({ isOpen: true, type: 'deleteComment', data: c._id })} className="text-slate-200 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <Link to={`/profile/${c.author._id}`}>
                                        <Avatar className="w-14 h-14 border-4 border-orange-50">
                                            <AvatarImage src={c.author.profileImage} />
                                            <AvatarFallback className="bg-orange-100 text-orange-600 font-black text-xl">{c.author.username?.[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <Link to={`/profile/${c.author._id}`} className={`font-black text-lg hover:text-orange-500 transition-colors ${c.author.isBlocked ? "text-red-500" : "text-slate-900"}`}>
                                                {c.author.username} {c.author.isBlocked && "[БЛОКИРАН]"}
                                            </Link>
                                            <div className="text-xs font-bold text-slate-300 uppercase tracking-tighter shrink-0">{new Date(c.createdAt).toLocaleDateString('bg-BG')}</div>
                                        </div>

                                        {isEditing ? (
                                            <div className="mt-3 space-y-3 flex flex-col items-start w-full">
                                                <Textarea
                                                    className="w-full bg-slate-50 border-none rounded-2xl p-5 resize-none min-h-[60px] shadow-inner text-lg"
                                                    value={editCommentText}
                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                />
                                                <div className="flex gap-2">
                                                    <Button onClick={() => handleUpdateComment(c._id)} className="bg-orange-500 text-white font-black uppercase text-[10px] h-8 px-4 rounded-lg shadow-md border-none">
                                                        <Check size={14} className="mr-1" />Запази
                                                    </Button>
                                                    <Button onClick={() => setEditingCommentId(null)} variant="ghost" className="font-black uppercase text-[10px] h-8 px-4">
                                                        Отказ
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-slate-600 text-lg leading-relaxed break-words">{c.text}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            <ConfirmationDialog
                isOpen={confirmData.isOpen}
                onOpenChange={(open) => setConfirmState({ ...confirmData, isOpen: open })}
                onConfirm={executeAction}
                title={
                    confirmData.type === 'deleteRecipe' ? "Изтриване на рецепта" :
                        confirmData.type === 'blockUser' ? "Блокиране на потребител" :
                            confirmData.type === 'rejectUpdate' ? "Отхвърляне на промени" :
                                confirmData.type === 'approveRecipe' ? (recipe.hasPendingUpdates ? "Прилагане на промени" : "Одобряване на рецепта") :
                                    "Изтриване на коментар"
                }
                description={
                    confirmData.type === 'deleteRecipe' ? "Сигурни ли сте, че искате да изтриете тази рецепта? Това действие е необратимо." :
                        confirmData.type === 'blockUser' ? `Сигурни ли сте, че искате да блокирате ${confirmData.data?.username}? Всички негови данни ще бъдат премахнати.` :
                            confirmData.type === 'rejectUpdate' ? "Сигурни ли сте, че искате да отхвърлите предложените редакции?" :
                                confirmData.type === 'approveRecipe' ? (recipe.hasPendingUpdates ? "Сигурни ли сте, че искате да приложите новите редакции към тази рецепта?" : "Сигурни ли сте, че искате да одобрите тази рецепта за публикуване?") :
                                    "Сигурни ли сте, че искате да премахнете този коментар?"
                }
                confirmText={
                    confirmData.type === 'blockUser' ? "Блокирай" :
                        confirmData.type === 'rejectUpdate' ? "Отхвърли" :
                            confirmData.type === 'approveRecipe' ? (recipe.hasPendingUpdates ? "Приложи" : "Одобри") :
                                "Изтрий"
                }
            />

            {
                isReportOpen && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
                        <div className="bg-[#fcfaf7] w-full max-w-md rounded-2xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setIsReportOpen(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Докладване</h2>

                            <p className="text-slate-500 leading-relaxed mb-8 text-sm font-medium">
                                Моля, докладвайте рецепта само ако тя съдържа реклами, неподходящо съдържание, език на омразата или спам. Нашият екип ще я прегледа възможно най-скоро.
                            </p>

                            <div className="flex justify-end items-center gap-6">
                                <button
                                    onClick={() => setIsReportOpen(false)}
                                    className="text-slate-900 font-bold text-lg hover:text-orange-500 transition-colors font-medium"
                                >
                                    Отказ
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await api.post(`/recipes/${recipe._id}/report`, { reason: "Recipe Report" });
                                            setIsReportOpen(false);
                                            toast({ title: "Изпратено!", description: "Администратор ще прегледа рецептата." });
                                        } catch (err) {
                                            toast({ variant: "destructive", title: "Грешка при изпращане" });
                                        }
                                    }}
                                    className="text-orange-500 font-black text-lg hover:text-slate-950 transition-all font-medium"
                                >
                                    Докладвай
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default RecipeDetails;