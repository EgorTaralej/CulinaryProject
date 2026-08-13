import { useState, useContext } from 'react';
import { useLoaderData, useRevalidator, Link } from 'react-router-dom';
import api from '@/services/api';
import { AuthContext } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ChevronLeft, Send, PlayCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export const recipeLoader = async ({ params }) => {
    const res = await api.get(`/recipes/${params.id}`);
    return res.data;
};

const RecipeDetails = () => {
    const { recipe, comments } = useLoaderData();
    const { toast } = useToast();
    const revalidator = useRevalidator();
    const [newComment, setNewComment] = useState('');

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await api.post(`/recipes/${recipe._id}/comment`, { text: newComment });
            setNewComment('');
            revalidator.revalidate(); // Опреснява данните магически
            toast({ title: "Коментарът е добавен!" });
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка" });
        }
    };

    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYoutubeId(recipe.videoUrl);

    return (
        <div className="max-w-4xl mx-auto py-10">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-red-600 mb-8 font-bold transition-colors">
                <ChevronLeft size={20} /> Назад
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                <div className="aspect-square rounded-[2.5rem] overflow-hidden shadow-xl">
                    <img src={recipe.mainImage} className="w-full h-full object-cover" alt={recipe.title} />
                </div>
                <div className="flex flex-col justify-center space-y-6">
                    <h1 className="text-5xl font-black">{recipe.title}</h1>
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xl">
                        <Star fill="currentColor" /> {recipe.averageRating.toFixed(1)}
                    </div>
                    <p className="text-xl text-slate-500 italic">"{recipe.description}"</p>
                    <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Автор: {recipe.author.username}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
                <div className="lg:col-span-2 space-y-12">
                    <h2 className="text-3xl font-black">Инструкции</h2>
                    {recipe.steps.map((step, i) => (
                        <div key={i} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-black">{i+1}</span>
                                <p className="text-xl text-slate-700">{step.text}</p>
                            </div>
                            {step.image && <img src={step.image} className="w-full rounded-3xl shadow-md border-4 border-white" />}
                        </div>
                    ))}
                    {videoId && (
                        <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}`} allowFullScreen></iframe>
                        </div>
                    )}
                </div>
                <div>
                    <Card className="p-8 rounded-[2rem] shadow-lg border-none sticky top-24">
                        <h3 className="text-2xl font-black mb-6">Съставки</h3>
                        <ul className="space-y-4">
                            {recipe.ingredients.map((ing, i) => (
                                <li key={i} className="text-lg text-slate-600 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {ing}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>

            <div className="max-w-2xl space-y-8">
                <h2 className="text-3xl font-black">Коментари</h2>
                <form onSubmit={handleAddComment} className="relative">
                    <Textarea 
                        placeholder="Напишете нещо..." 
                        className="rounded-3xl p-6 bg-white shadow-lg border-none min-h-[100px]"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button type="submit" className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 rounded-2xl w-12 h-12 p-0">
                        <Send size={20} />
                    </Button>
                </form>
                <div className="space-y-4">
                    {comments.map((c) => (
                        <div key={c._id} className="bg-white p-6 rounded-3xl shadow-sm flex gap-4">
                            <Avatar><AvatarFallback className="bg-red-100 text-red-600 font-bold">{c.author.username[0]}</AvatarFallback></Avatar>
                            <div>
                                <div className="font-black">{c.author.username}</div>
                                <p className="text-slate-600">{c.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecipeDetails;