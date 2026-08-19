import { useState } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Upload, Loader2, Image as ImageIcon, Video, X, CheckCircle2, AlertCircle, Clock, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from '@/components/ConfirmationDialog';

export const categoriesLoader = async () => {
    const res = await api.get('/categories');
    return res.data;
};

const CreateRecipe = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const allCategories = useLoaderData() || [];
    
    const [loading, setLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [stepToDelete, setStepToDelete] = useState(null);

    const [mainImage, setMainImage] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState(['']);
    const [steps, setSteps] = useState([{ text: '', image: '' }]);
    const [videoUrl, setVideoUrl] = useState('');
    
    const [prepTime, setPrepTime] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [servings, setServings] = useState('');

    const cuisines = allCategories.filter(c => c.type === 'cuisine');
    const diets = allCategories.filter(c => c.type === 'diet');
    const difficulties = allCategories.filter(c => c.type === 'difficulty');

    const [category, setCategory] = useState({ 
        cuisine: cuisines[0]?.name || '', 
        diet: diets[0]?.name || '', 
        difficulty: difficulties[0]?.name || '' 
    });

    const handleImageUpload = async (file, callback) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        toast({ title: "Качване...", description: "Снимката се обработва." });
        try {
            const res = await api.post('/upload', formData);
            callback(res.data.imageUrl);
            toast({ title: "Успех", description: "Снимката е готова!" });
        } catch (err) { toast({ variant: "destructive", title: "Грешка" }); }
    };

    const confirmDelete = () => {
        setSteps(steps.filter((_, i) => i !== stepToDelete));
        setIsConfirmOpen(false);
        setStepToDelete(null);
        toast({ 
            title: (
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    <span className="font-bold text-slate-900">Успешно изтрита стъпка!</span>
                </div>
            )
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let missing = [];
        if (!mainImage) missing.push("основна снимка");
        if (!title.trim()) missing.push("заглавие");
        if (ingredients.filter(ing => ing.trim()).length === 0) missing.push("поне една съставка");
        if (!steps[0].text.trim()) missing.push("описание на първа стъпка");

        if (missing.length > 0) {
            return toast({
                variant: "destructive",
                title: <div className="flex items-center gap-2"><AlertCircle size={18}/> Липсваща информация</div>,
                description: `Моля, добавете: ${missing.join(", ")}.`
            });
        }

        setLoading(true);
        try {
            await api.post('/recipes', { 
                title, 
                description, 
                mainImage, 
                ingredients, 
                steps, 
                category, 
                videoUrl,
                prepTime,
                cookTime,
                servings
            });
            toast({ title: "Рецептата е споделена!" });
            navigate('/');
        } catch (err) { toast({ variant: "destructive", title: "Грешка при запис" }); }
        finally { setLoading(false); }
    };

    const renderBadges = (items, currentField) => (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <button
                    key={item._id}
                    type="button"
                    onClick={() => setCategory({ ...category, [currentField]: item.name })}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        category[currentField] === item.name
                            ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                >
                    {item.name}
                </button>
            ))}
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-black text-slate-950 mb-10 tracking-tight">Нова рецепта</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div onClick={() => document.getElementById('main-upload').click()} className="relative h-96 bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-orange-500 transition-all flex items-center justify-center shadow-inner">
                        {mainImage ? <img src={mainImage} className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><ImageIcon size={60} className="mx-auto mb-4" /><p className="font-bold text-lg">Кликнете за основна снимка</p></div>}
                        <input id="main-upload" type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], setMainImage)} />
                    </div>

                    <Card className="p-10 space-y-8 border-none shadow-xl rounded-[2.5rem] bg-white">
                        <div className="space-y-3 max-w-md">
                            <Label className="text-lg font-bold ml-1 text-slate-800">Име на ястието</Label>
                            <Input className="rounded-xl bg-slate-50 border-none h-12 focus:ring-0" placeholder="Как се казва ястието?" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-400 font-black uppercase text-[10px] tracking-widest ml-1 flex items-center gap-1.5">
                                    <Clock size={12} /> Подготовка (мин.)
                                </Label>
                                <Input 
                                    type="text" 
                                    placeholder="напр. 20" 
                                    className="rounded-xl bg-slate-50 border-none h-12"
                                    value={prepTime} 
                                    onChange={(e) => setPrepTime(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-400 font-black uppercase text-[10px] tracking-widest ml-1 flex items-center gap-1.5">
                                    <Clock size={12} /> Готвене (мин.)
                                </Label>
                                <Input 
                                    type="text" 
                                    placeholder="напр. 45" 
                                    className="rounded-xl bg-slate-50 border-none h-12"
                                    value={cookTime} 
                                    onChange={(e) => setCookTime(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-400 font-black uppercase text-[10px] tracking-widest ml-1 flex items-center gap-1.5">
                                    <Users size={12} /> Порции
                                </Label>
                                <Input 
                                    type="text" 
                                    placeholder="напр. 4" 
                                    className="rounded-xl bg-slate-50 border-none h-12"
                                    value={servings} 
                                    onChange={(e) => setServings(e.target.value)} 
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase ml-1 text-slate-400">Кухня</Label>
                                {renderBadges(cuisines, 'cuisine')}
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase ml-1 text-slate-400">Диета</Label>
                                {renderBadges(diets, 'diet')}
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase ml-1 text-slate-400">Трудност</Label>
                                {renderBadges(difficulties, 'difficulty')}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-lg font-bold ml-1 text-slate-800">Описание</Label>
                            <Textarea className="rounded-2xl min-h-[120px] bg-slate-50 border-none focus:ring-0 p-6 text-lg placeholder:text-muted-foreground resize-none" placeholder="Разкажете нещо интересно за тази рецепта..." value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        <div className="space-y-3 w-full">
                            <Label className="text-lg font-bold ml-1 flex items-center gap-2 text-slate-800"><Video className="text-orange-500" size={20} /> Видео линк</Label>
                            <Input className="rounded-xl bg-slate-50 border-none h-14 text-lg focus:ring-0" placeholder="Линк от YouTube" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-800 ml-2">Начин на приготвяне</h3>
                        {steps.map((step, index) => (
                            <Card key={index} className="p-8 border-none shadow-lg rounded-[2.5rem] bg-white space-y-6 relative">
                                <div className="flex justify-between items-center">
                                    <span className="bg-orange-500 text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase">Стъпка {index + 1}</span>
                                    {index !== 0 && <Button type="button" variant="ghost" size="sm" onClick={() => { setStepToDelete(index); setIsConfirmOpen(true); }} className="text-slate-300 hover:text-orange-500"><Trash2 size={24} /></Button>}
                                </div>
                                <Textarea className="rounded-2xl bg-slate-50 border-none focus-visible:ring-orange-500 text-lg p-6 placeholder:text-muted-foreground" placeholder="Опишете какво се прави..." value={step.text} onChange={(e) => {
                                    const newSteps = [...steps];
                                    newSteps[index].text = e.target.value;
                                    setSteps(newSteps);
                                }} />
                            </Card>
                        ))}
                        <Button type="button" variant="outline" className="w-full py-14 border-4 border-dashed rounded-[2.5rem] text-slate-400 hover:text-orange-500 transition-all font-bold text-xl" onClick={() => setSteps([...steps, { text: '', image: '' }])}>+ Добави следваща стъпка</Button>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white">
                        <h3 className="font-black text-slate-800 mb-6 text-xl uppercase tracking-tight">Съставки</h3>
                        <div className="space-y-3">
                            {ingredients.map((ing, index) => (
                                <div key={index} className="flex gap-2 mb-3 group">
                                    <Input className="rounded-xl bg-slate-50 border-none h-14 placeholder:text-muted-foreground" placeholder="Напр. 500г брашно" value={ing} onChange={(e) => {
                                        const newIngs = [...ingredients];
                                        newIngs[index] = e.target.value;
                                        setIngredients(newIngs);
                                    }} />
                                    {index !== 0 && <Button type="button" variant="ghost" size="sm" onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))} className="text-slate-300 hover:text-red-500"><Trash2 size={20} /></Button>}
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="link" onClick={() => setIngredients([...ingredients, ''])} className="text-orange-600 font-bold p-0 mt-4 hover:no-underline underline-none">
                            + Добави съставка
                        </Button>
                    </Card>

                    <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-slate-950 text-white py-8 rounded-2xl font-bold text-xl shadow-lg transition-all flex items-center justify-center">
                        {loading ? <Loader2 className="animate-spin" /> : 'Публикувай рецептата'}
                    </Button>
                </div>
            </form>

            <ConfirmationDialog isOpen={isConfirmOpen} onOpenChange={setIsConfirmOpen} onConfirm={confirmDelete} title="Премахни" description="Сигурни ли сте, че искате да изтриете тази стъпка?" />
        </div>
    );
};

export default CreateRecipe;