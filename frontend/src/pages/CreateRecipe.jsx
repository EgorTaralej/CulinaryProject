import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Upload, Loader2, Image as ImageIcon, Video, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const CreateRecipe = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [mainImage, setMainImage] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState(['']);
    const [steps, setSteps] = useState([{ text: '', image: '' }]);
    const [videoUrl, setVideoUrl] = useState('');
    const [category, setCategory] = useState({ cuisine: 'Българска', diet: 'Стандартна', difficulty: 'Лесно' });

    const handleImageUpload = async (file, callback) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);

        toast({ title: "Качване...", description: "Снимката се изпраща към облака" });

        try {
            const res = await api.post('/upload', formData);
            callback(res.data.imageUrl);
            toast({ title: "Успех", description: "Снимката е готова!" });
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка", description: "Неуспешно качване." });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ПЕРСОНАЛИЗИРАНА ВАЛИДАЦИЯ (Toasts вместо системни балончета)
        if (!mainImage) return toast({ variant: "destructive", title: "Липсва снимка", description: "Моля, качете основна снимка на ястието." });
        if (!title.trim()) return toast({ variant: "destructive", title: "Липсва заглавие", description: "Моля, въведете име на рецептата." });
        if (!description.trim()) return toast({ variant: "destructive", title: "Липсва описание", description: "Напишете кратко описание." });
        if (ingredients.some(ing => !ing.trim())) return toast({ variant: "destructive", title: "Празни съставки", description: "Попълнете всички съставки или ги изтрийте." });
        if (steps.some(step => !step.text.trim())) return toast({ variant: "destructive", title: "Празни стъпки", description: "Всяка стъпка трябва да има текст." });

        setLoading(true);
        try {
            await api.post('/recipes', { title, description, mainImage, ingredients, steps, category, videoUrl });
            toast({ title: "Рецептата е споделена!", description: "Вече е видима за всички." });
            navigate('/');
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка", description: "Нещо се обърка при записа." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tight italic">Recipe<span className="text-red-600">Share</span></h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">

                    {/* ОСНОВНА СНИМКА - Цялата зона е бутон */}
                    <div
                        onClick={() => document.getElementById('main-upload').click()}
                        className="relative h-96 bg-slate-100 rounded-[2.5rem] border-4 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-red-500 hover:bg-slate-50 transition-all group flex items-center justify-center"
                    >
                        {mainImage ? (
                            <img src={mainImage} className="w-full h-full object-cover" alt="Main" />
                        ) : (
                            <div className="text-center">
                                <ImageIcon size={80} strokeWidth={1} className="mx-auto text-slate-300 group-hover:text-red-500 transition-colors mb-4" />
                                <p className="text-slate-500 font-bold text-lg">Кликнете тук за основна снимка</p>
                            </div>
                        )}
                        <input id="main-upload" type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], setMainImage)} />
                    </div>

                    <Card className="p-8 space-y-6 border-none shadow-xl rounded-[2rem] bg-white">
                        <div className="space-y-2">
                            <Label className="text-lg font-black ml-1">Заглавие</Label>
                            <Input className="text-2xl py-8 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-red-500" placeholder="Как се казва ястието?" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-lg font-black ml-1">Описание</Label>
                            <Textarea className="rounded-2xl min-h-[120px] bg-slate-50 border-none focus-visible:ring-red-500" placeholder="Разкажете нещо интересно за тази рецепта..." value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-lg font-black ml-1 flex items-center gap-2"><Video className="text-red-600" /> Видео линк</Label>
                            <Input className="rounded-xl bg-slate-50 border-none focus-visible:ring-red-500" placeholder="Линк от YouTube (незадължително)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                        </div>
                    </Card>

                    {/* СТЪПКИ */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-800 ml-2">Начин на приготвяне</h3>
                        {steps.map((step, index) => (
                            <Card key={index} className="p-8 border-none shadow-lg rounded-[2rem] bg-white space-y-6 relative">
                                <div className="flex justify-between items-center">
                                    <span className="bg-red-600 text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">Стъпка {index + 1}</span>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setSteps(steps.filter((_, i) => i !== index))} className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full w-10 h-10 p-0"><Trash2 size={20} /></Button>
                                </div>
                                <Textarea className="rounded-2xl bg-slate-50 border-none focus-visible:ring-red-500 text-lg" placeholder="Опишете какво се прави..." value={step.text} onChange={(e) => {
                                    const newSteps = [...steps];
                                    newSteps[index].text = e.target.value;
                                    setSteps(newSteps);
                                }} />

                                <div className="flex items-center gap-4">
                                    {step.image ? (
                                        <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-inner border-4 border-white">
                                            <img src={step.image} className="w-full h-full object-cover" alt="step" />
                                            <button type="button" onClick={() => {
                                                const newSteps = [...steps];
                                                newSteps[index].image = '';
                                                setSteps(newSteps);
                                            }} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <Button type="button" variant="outline" className="rounded-2xl border-dashed border-2 h-32 w-32 flex-col gap-2 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all" onClick={() => document.getElementById(`file-${index}`).click()}>
                                            <Upload size={24} />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">Снимка</span>
                                        </Button>
                                    )}
                                    <input id={`file-${index}`} type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], (url) => {
                                        const newSteps = [...steps];
                                        newSteps[index].image = url;
                                        setSteps(newSteps);
                                    })} />
                                </div>
                            </Card>
                        ))}
                        <Button type="button" variant="outline" className="w-full py-12 border-4 border-dashed rounded-[2rem] text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-white transition-all font-black text-lg" onClick={() => setSteps([...steps, { text: '', image: '' }])}>
                            + ДОБАВИ СЛЕДВАЩА СТЪПКА
                        </Button>
                    </div>
                </div>

                {/* СТРАНИЧНА ЛЕНТА */}
                <div className="space-y-8">
                    <Card className="p-8 border-none shadow-xl rounded-[2rem] bg-white">
                        <h3 className="font-black text-slate-800 mb-6 text-xl uppercase tracking-tight">Съставки</h3>
                        <div className="space-y-3">
                            {ingredients.map((ing, index) => (
                                <div key={index} className="flex gap-2 group">
                                    <Input className="rounded-xl bg-slate-50 border-none focus-visible:ring-red-500 font-medium" placeholder="Напр. 500г брашно" value={ing} onChange={(e) => {
                                        const newIngs = [...ingredients];
                                        newIngs[index] = e.target.value;
                                        setIngredients(newIngs);
                                    }} />
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-600 transition-opacity">
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="link" onClick={() => setIngredients([...ingredients, ''])} className="text-red-600 font-black p-0 mt-6 hover:no-underline hover:text-red-700 uppercase text-xs tracking-widest">
                            + Добави съставка
                        </Button>
                    </Card>

                    <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-12 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-red-200 transition-all active:scale-95 flex flex-col gap-1">
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                <span>ПУБЛИКУВАЙ</span>
                                <span className="text-[10px] opacity-60 font-medium tracking-[0.2em]">RECIPESHARE COMMUNITY</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateRecipe;