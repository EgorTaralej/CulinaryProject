import { useState, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import api from '@/services/api';
import RecipeCard from '@/components/RecipeCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search as SearchIcon, SlidersHorizontal, X, UtensilsCrossed } from 'lucide-react';

export const searchLoader = async () => {
    const [recipesRes, categoriesRes] = await Promise.all([
        api.get('/recipes'),
        api.get('/categories')
    ]);
    return { recipes: recipesRes.data, categories: categoriesRes.data };
};

const Search = () => {
    const { recipes, categories } = useLoaderData();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCuisine, setSelectedCuisine] = useState('Всички');
    const [selectedDiet, setSelectedDiet] = useState('Всички');
    const [selectedDiff, setSelectedDiff] = useState('Всички');
    const [selectedDishType, setSelectedDishType] = useState('Всички');
    const [includeTags, setIncludeTags] = useState([]);
    const [excludeTags, setExcludeTags] = useState([]);
    const [tagInput, setTagInput] = useState({ include: '', exclude: '' });

    const cuisines = categories.filter(c => c.type === 'cuisine');
    const diets = categories.filter(c => c.type === 'diet');
    const difficulties = categories.filter(c => c.type === 'difficulty');
    const dishTypes = categories.filter(c => c.type === 'dishType');

    const filteredRecipes = useMemo(() => {
        return recipes.filter(recipe => {
            const matchesText = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesCuisine = selectedCuisine === 'Всички' || recipe.category?.cuisine === selectedCuisine;
            const matchesDiet = selectedDiet === 'Всички' || 
                               (selectedDiet === 'Без диета' ? !recipe.category?.diet : recipe.category?.diet === selectedDiet);
            const matchesDiff = selectedDiff === 'Всички' || recipe.category?.difficulty === selectedDiff;
            const matchesDishType = selectedDishType === 'Всички' || recipe.category?.dishType === selectedDishType;

            const recipeIngs = recipe.ingredients.map(i => i.toLowerCase());
            const hasIncluded = includeTags.length === 0 || 
                includeTags.every(tag => recipeIngs.some(ing => ing.includes(tag.toLowerCase())));
            const hasExcluded = excludeTags.some(tag => 
                recipeIngs.some(ing => ing.includes(tag.toLowerCase())));

            return matchesText && matchesCuisine && matchesDiet && matchesDiff && matchesDishType && hasIncluded && !hasExcluded;
        });
    }, [searchQuery, selectedCuisine, selectedDiet, selectedDiff, selectedDishType, includeTags, excludeTags, recipes]);

    const handleAddTag = (type) => {
        const val = tagInput[type].trim();
        if (!val) return;
        if (type === 'include') {
            if (!includeTags.includes(val)) setIncludeTags([...includeTags, val]);
            setTagInput({ ...tagInput, include: '' });
        } else {
            if (!excludeTags.includes(val)) setExcludeTags([...excludeTags, val]);
            setTagInput({ ...tagInput, exclude: '' });
        }
    };

    const handleReset = () => {
        setSearchQuery('');
        setSelectedCuisine('Всички');
        setSelectedDiet('Всички');
        setSelectedDiff('Всички');
        setSelectedDishType('Всички');
        setIncludeTags([]);
        setExcludeTags([]);
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="mb-12 space-y-8 text-center">
                <h1 className="text-5xl font-black text-slate-950 tracking-tighter italic">
                    Търсене на <span className="text-orange-500">рецепти</span>
                </h1>
                
                <div className="max-w-3xl mx-auto flex gap-3">
                    <div className="relative flex-1 group">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                        <Input 
                            placeholder="Търси по име или съставка..."
                            className="w-full pl-14 pr-6 py-8 rounded-2xl border-none shadow-2xl text-lg focus-visible:ring-1 focus-visible:ring-orange-500 bg-white shadow-orange-100/50 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-16 px-6 rounded-2xl transition-all shadow-xl ${showFilters ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border-none'}`}
                    >
                        <SlidersHorizontal size={24} />
                    </Button>
                </div>

                {showFilters && (
                    <Card className="max-w-3xl mx-auto p-8 border-none shadow-2xl rounded-[2.5rem] bg-white animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Тип ястие</Label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setSelectedDishType('Всички')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDishType === 'Всички' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>Всички</button>
                                    {dishTypes.map(dt => (
                                        <button key={dt._id} onClick={() => setSelectedDishType(dt.name)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDishType === dt.name ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>{dt.name}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Кухня</Label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setSelectedCuisine('Всички')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCuisine === 'Всички' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>Всички</button>
                                    {cuisines.map(c => (
                                        <button key={c._id} onClick={() => setSelectedCuisine(c.name)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCuisine === c.name ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>{c.name}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Диета</Label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setSelectedDiet('Всички')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDiet === 'Всички' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>Всички</button>
                                    <button onClick={() => setSelectedDiet('Без диета')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDiet === 'Без диета' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>Без диета</button>
                                    {diets.map(d => (
                                        <button key={d._id} onClick={() => setSelectedDiet(d.name)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDiet === d.name ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>{d.name}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Трудност</Label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setSelectedDiff('Всички')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDiff === 'Всички' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>Всички</button>
                                    {difficulties.map(diff => (
                                        <button key={diff._id} onClick={() => setSelectedDiff(diff.name)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDiff === diff.name ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>{diff.name}</button>
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Тип ястие</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => setSelectedDishType('Всички')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDishType === 'Всички' ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-500'}`}>Всички</button>
                                        {dishTypes.map(dt => (
                                            <button key={dt._id} onClick={() => setSelectedDishType(dt.name)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDishType === dt.name ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-500'}`}>{dt.name}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase text-emerald-600 ml-1">Имам в хладилника</Label>
                                <Input 
                                    placeholder="Добави и Enter..." 
                                    className="bg-slate-50 border-none rounded-xl"
                                    value={tagInput.include}
                                    onChange={(e) => setTagInput({...tagInput, include: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag('include')}
                                />
                                <div className="flex flex-wrap gap-2">
                                    {includeTags.map(t => <Badge key={t} className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 rounded-full">{t} <X size={14} className="ml-2 cursor-pointer" onClick={() => setIncludeTags(includeTags.filter(x => x !== t))} /></Badge>)}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase text-red-500 ml-1">БЕЗ съставка</Label>
                                <Input 
                                    placeholder="Добави и Enter..." 
                                    className="bg-slate-50 border-none rounded-xl"
                                    value={tagInput.exclude}
                                    onChange={(e) => setTagInput({...tagInput, exclude: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag('exclude')}
                                />
                                <div className="flex flex-wrap gap-2">
                                    {excludeTags.map(t => <Badge key={t} className="bg-red-100 text-red-600 border-none px-3 py-1 rounded-full">{t} <X size={14} className="ml-2 cursor-pointer" onClick={() => setExcludeTags(excludeTags.filter(x => x !== t))} /></Badge>)}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight">Резултати <span className="text-slate-300 ml-2">({filteredRecipes.length})</span></h2>
                    {(searchQuery || selectedCuisine !== 'Всички' || selectedDiet !== 'Всички' || selectedDiff !== 'Всички' || includeTags.length > 0 || excludeTags.length > 0) && (
                        <button onClick={handleReset} className="text-sm font-black text-orange-600 hover:text-slate-950 uppercase tracking-widest transition-colors">Изчисти всичко</button>
                    )}
                </div>
                
                {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredRecipes.map(recipe => (
                            <RecipeCard key={recipe._id} recipe={recipe} />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-slate-50 rounded-[3.5rem] border-4 border-dashed border-slate-100">
                        <UtensilsCrossed className="mx-auto text-slate-200 mb-4" size={64} />
                        <p className="text-slate-400 font-black text-2xl uppercase tracking-tighter italic">Няма открити рецепти</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;