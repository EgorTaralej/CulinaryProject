import { useState, useContext, useMemo } from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import api from '@/services/api';
import { AuthContext } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Send, PlayCircle, User, Utensils, Heart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export const recipeLoader = async ({ params }) => {
    const res = await api.get(`/recipes/${params.id}`);
    return res.data;
};

const RecipeDetails = () => {
    const { recipe: initialRecipe, comments: initialComments } = useLoaderData();
    const { toast } = useToast();
    const { user, refreshUser } = useContext(AuthContext);
    
    const [recipe, setRecipe] = useState(initialRecipe);
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');

    const existingRating = recipe.ratings?.find(r => (r.user._id || r.user) === user?.id);
    const [userRating, setUserRating] = useState(existingRating?.stars || 0);

    const isAuthor = user?.id === recipe.author._id;
    
    const isFavorite = useMemo(() => {
        return user?.favorites?.some(fav => (fav._id || fav) === recipe._id);
    }, [user?.favorites, recipe._id]);

    const handleToggleFavorite = async () => {
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
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/recipes/${recipe._id}/comment`, { text: newComment });
            setComments([res.data, ...comments]);
            setNewComment('');
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка" });
        }
    };

    const handleRate = async (stars) => {
        if (isAuthor) return;
        try {
            const res = await api.post(`/recipes/${recipe._id}/rate`, { stars });
            setRecipe({ ...recipe, averageRating: res.data.averageRating });
            setUserRating(stars);
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка" });
        }
    };

    const videoId = useMemo(() => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = recipe.videoUrl?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }, [recipe.videoUrl]);

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                    {recipe.mainImage ? <img src={recipe.mainImage} className="w-full h-full object-cover" alt={recipe.title} /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">Няма снимка</div>}
                </div>

                <div className="flex flex-col space-y-6">
                    <div className="flex justify-between items-start">
                        <h1 className="text-5xl font-black text-slate-950 leading-tight">{recipe.title}</h1>
                        <Button 
                            type="button"
                            onClick={handleToggleFavorite}
                            variant="ghost" 
                            className={`rounded-full w-14 h-14 p-0 transition-all border-2 ${
                                isFavorite 
                                ? 'text-orange-500 border-orange-500 bg-orange-50' 
                                : 'text-slate-950 border-slate-200 bg-white hover:border-orange-500 hover:text-orange-500'
                            }`}
                        >
                            <Heart fill={isFavorite ? "currentColor" : "none"} size={28} strokeWidth={2.5} />
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-amber-500 font-black text-xl">
                            <Star fill="currentColor" size={24} /> {recipe.averageRating.toFixed(1)}
                            <span className="text-sm text-slate-300 ml-1">({recipe.ratings?.length || 0})</span>
                        </div>
                        <Separator orientation="vertical" className="h-6 bg-slate-200" />
                        <Link to={`/profile/${recipe.author._id}`} className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-orange-500">
                            <User size={16} className="text-orange-500" /> {recipe.author.username}
                        </Link>
                    </div>
                    
                    <p className="text-xl text-slate-500 leading-relaxed border-l-4 border-orange-400 pl-6">{recipe.description}</p>

                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-slate-100 rounded-full text-xs font-black text-slate-600 uppercase">{recipe.category?.cuisine}</div>
                        <div className="px-4 py-2 bg-orange-50 rounded-full text-xs font-black text-orange-600 uppercase">{recipe.category?.difficulty}</div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{isAuthor ? "Не можете да оценявате собствена рецепта" : "Вашата оценка"}</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => handleRate(star)} disabled={isAuthor} className={`p-2 rounded-xl transition-all ${userRating >= star ? 'text-orange-500 bg-orange-50' : 'text-slate-300 bg-slate-50'} ${isAuthor ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-100'}`}><Star size={28} fill={userRating >= star ? "currentColor" : "none"} /></button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
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
                <form onSubmit={handleAddComment} className="relative group">
                    <Textarea placeholder="Споделете вашето мнение..." className="rounded-[2rem] p-8 bg-white shadow-2xl border-none text-lg focus-visible:ring-2 focus-visible:ring-orange-500 min-h-[140px] transition-all resize-none" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                    <Button type="submit" className="absolute bottom-6 right-6 bg-orange-500 hover:bg-slate-950 text-white rounded-2xl w-14 h-14 p-0 shadow-lg shadow-orange-200 transition-all active:scale-90"><Send size={24} /></Button>
                </form>
                <div className="space-y-6">
                    {comments.map((c) => (
                        <div key={c._id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 flex gap-6 hover:shadow-md transition-shadow">
                            <Avatar className="w-14 h-14 border-4 border-orange-50"><AvatarFallback className="bg-orange-100 text-orange-600 font-black text-xl">{c.author.username[0].toUpperCase()}</AvatarFallback></Avatar>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="font-black text-slate-900 text-lg">{c.author.username}</div>
                                    <div className="text-xs font-bold text-slate-300 uppercase tracking-tighter">{new Date(c.createdAt).toLocaleDateString()}</div>
                                </div>
                                <p className="text-slate-600 text-lg leading-relaxed">{c.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecipeDetails;