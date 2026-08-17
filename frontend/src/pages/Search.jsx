import { useState, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import api from '@/services/api';
import RecipeCard from '@/components/RecipeCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search as SearchIcon, SlidersHorizontal, X, Plus, Ban } from 'lucide-react';

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
    const [includeTags, setIncludeTags] = useState([]);
    const [excludeTags, setExcludeTags] = useState([]);
    const [tagInput, setTagInput] = useState({ include: '', exclude: '' });

    const filteredRecipes = useMemo(() => {
        return recipes.filter(recipe => {
            const matchesText = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesCuisine = selectedCuisine === 'Всички' || recipe.category?.cuisine === selectedCuisine;
            const matchesDiet = selectedDiet === 'Всички' || recipe.category?.diet === selectedDiet;
            const matchesDiff = selectedDiff === 'Всички' || recipe.category?.difficulty === selectedDiff;

            const recipeIngs = recipe.ingredients.map(i => i.toLowerCase());
            const hasIncluded = includeTags.length === 0 || 
                includeTags.every(tag => recipeIngs.some(ing => ing.includes(tag.toLowerCase())));
            const hasExcluded = excludeTags.some(tag => 
                recipeIngs.some(ing => ing.includes(tag.toLowerCase())));

            return matchesText && matchesCuisine && matchesDiet && matchesDiff && hasIncluded && !hasExcluded;
        });
    }, [searchQuery, selectedCuisine, selectedDiet, selectedDiff, includeTags, excludeTags, recipes]);

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

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="mb-12 space-y-8">
                <h1 className="text-4xl font-black text-slate-950 tracking-tight text-center">
                    Търсене на <span className="text-orange-500 italic">рецепти</span>
                </h1>
                
                {/* Главна търсачка */}
                <div className="max-w-3xl mx-auto flex gap-3">
                    <div className="relative flex-1 group">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <Input 
                            placeholder="Търси по име или съставка..."
                            className="w-full pl-14 pr-6 py-8 rounded-2xl border-none shadow-2xl text-lg focus-visible:ring-0 bg-white !shadow-orange-100/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-16 px-6 rounded-2xl transition-all ${showFilters ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 shadow-2xl hover:bg-slate-50'}`}
                    >
                        <SlidersHorizontal size={24} />
                    </Button>
                </div>

                {/* Панел с разширени филтри */}
                {showFilters && (
                    <Card className="max-w-3xl mx-auto p-8 border-none shadow-2xl rounded-[2.5rem] bg-white animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            {/* Кухня */}
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase text-slate-400 ml-1">Кухня</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Всички', ...categories.cuisines].map(c => (
                                        <button key={c} onClick={() => setSelectedCuisine(c)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCuisine === c ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{c}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Диета */}
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase text-slate-400 ml-1">Диета</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Всички', ...categories.diets].map(d => (
                                        <button key={d} onClick={() => setSelectedDiet(d)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDiet === d ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{d}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Трудност */}
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase text-slate-400 ml-1">Трудност</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Всички', ...categories.difficulties].map(diff => (
                                        <button key={diff} onClick={() => setSelectedDiff(diff)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDiff === diff ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{diff}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Тагове за включване/изключване */}
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

            {/* Списък с резултати */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black text-slate-950">Резултати <span className="text-slate-300 ml-2">({filteredRecipes.length})</span></h2>
                    {(searchQuery || includeTags.length > 0 || excludeTags.length > 0 || selectedCuisine !== 'Всички') && (
                        <button 
                            onClick={() => { setSearchQuery(''); setIncludeTags([]); setExcludeTags([]); setSelectedCuisine('Всички'); setSelectedDiet('Всички'); setSelectedDiff('Всички'); }} 
                            className="text-sm font-bold text-orange-600 hover:underline"
                        >
                            Изчисти всички
                        </button>
                    )}
                </div>
                
                {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredRecipes.map(recipe => (
                            <RecipeCard key={recipe._id} recipe={recipe} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                        <p className="text-slate-400 font-bold text-xl">Няма открити рецепти с тези критерии.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;