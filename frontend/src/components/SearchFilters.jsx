import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search as SearchIcon, SlidersHorizontal, X, RotateCcw, Loader2 } from 'lucide-react';

const SearchFilters = ({ categories, onSearch, loading, searchQuery, setSearchQuery, onReset }) => {
    const [showFilters, setShowFilters] = useState(false);
    
    const initialFilters = {
        cuisine: 'Всички',
        diet: 'Всички',
        difficulty: 'Всички',
        includeTags: [],
        excludeTags: []
    };

    const [localFilters, setLocalFilters] = useState(initialFilters);
    const [tagInput, setTagInput] = useState({ include: '', exclude: '' });

    const cuisines = categories.filter(c => c.type === 'cuisine');
    const diets = categories.filter(c => c.type === 'diet');
    const difficulties = categories.filter(c => c.type === 'difficulty');

    const handleInternalReset = () => {
        setLocalFilters(initialFilters);
        onReset();
    };

    const handleAddTag = (type) => {
        const val = tagInput[type].trim().toLowerCase();
        if (!val) return;
        if (!localFilters[`${type}Tags`].includes(val)) {
            setLocalFilters({
                ...localFilters,
                [`${type}Tags`]: [...localFilters[`${type}Tags`], val]
            });
        }
        setTagInput({ ...tagInput, [type]: '' });
    };

    const removeTag = (type, tagToRemove) => {
        setLocalFilters({
            ...localFilters,
            [`${type}Tags`]: localFilters[`${type}Tags`].filter(t => t !== tagToRemove)
        });
    };

    const renderBadges = (items, field) => (
        <div className="flex flex-wrap gap-2">
            {['Всички', ...items.map(i => i.name)].map((name) => (
                <button
                    key={name}
                    type="button"
                    onClick={() => setLocalFilters({ ...localFilters, [field]: name })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${localFilters[field] === name ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                    {name}
                </button>
            ))}
        </div>
    );

    return (
        <div className="w-full space-y-6">
            <div className="max-w-3xl mx-auto flex gap-3 items-center">
                
                <Button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-16 px-6 rounded-2xl transition-all border-none bg-white text-slate-600 shadow-xl hover:bg-slate-50 active:translate-y-0`}
                >
                    <SlidersHorizontal size={24} />
                </Button>

                <div className="relative flex-1 h-16 bg-white rounded-2xl shadow-xl flex items-center px-5 border-none">
                    <SearchIcon className="text-slate-400 mr-3" size={20} />
                    <Input 
                        placeholder="Търси по име или съставка..."
                        className="flex-1 border-none bg-transparent p-0 text-lg shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearch({ ...localFilters, query: searchQuery })}
                    />
                </div>
                
                <Button 
                    onClick={() => onSearch({ ...localFilters, query: searchQuery })}
                    disabled={loading}
                    className="h-16 px-8 rounded-2xl bg-orange-500 hover:bg-slate-950 text-white font-black text-lg shadow-[0_10px_25px_-5px_rgba(249,115,22,0.4)] transition-all border-none active:translate-y-0"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : 'Търси'}
                </Button>
            </div>

            {showFilters && (
                <Card className="max-w-3xl mx-auto p-8 border-none shadow-2xl rounded-[2.5rem] bg-white animate-in fade-in slide-in-from-top-4 duration-300 relative">
                    <button 
                        onClick={handleInternalReset}
                        className="absolute top-6 right-8 text-sm font-bold text-orange-600 hover:text-slate-950 transition-colors flex items-center gap-1"
                    >
                        <RotateCcw size={14} /> Изчисти филтрите
                    </button>

                    <div className="space-y-6 mb-8 text-left">
                        {['cuisine', 'diet', 'difficulty'].map(f => (
                            <div key={f} className="space-y-3">
                                <Label className="text-xs font-black uppercase text-slate-400 ml-1">{f === 'cuisine' ? 'Кухня' : f === 'diet' ? 'Диета' : 'Трудност'}</Label>
                                {renderBadges(categories.filter(c => c.type === f), f)}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                        <div className="space-y-3 text-left">
                            <Label className="text-xs font-black uppercase text-emerald-600 ml-1">Имам в хладилника</Label>
                            <Input 
                                placeholder="Добави и Enter..." 
                                className="bg-slate-50 border-none rounded-xl h-12 focus-visible:ring-0 shadow-none"
                                value={tagInput.include}
                                onChange={(e) => setTagInput({...tagInput, include: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag('include')}
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {localFilters.includeTags.map(t => (
                                    <Badge key={t} className="bg-emerald-50 text-emerald-700 border-none py-2 px-4 rounded-xl text-sm font-bold flex items-center gap-2">
                                        {t} 
                                        <button type="button" onClick={() => removeTag('include', t)} className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"><X size={14} /></button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3 text-left">
                            <Label className="text-xs font-black uppercase text-red-500 ml-1">БЕЗ съставка</Label>
                            <Input 
                                placeholder="Добави и Enter..." 
                                className="bg-slate-50 border-none rounded-xl h-12 focus-visible:ring-0 shadow-none"
                                value={tagInput.exclude}
                                onChange={(e) => setTagInput({...tagInput, exclude: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag('exclude')}
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {localFilters.excludeTags.map(t => (
                                    <Badge key={t} className="bg-red-50 text-red-600 border-none py-2 px-4 rounded-xl text-sm font-bold flex items-center gap-2">
                                        {t} 
                                        <button type="button" onClick={() => removeTag('exclude', t)} className="hover:bg-red-200 rounded-full p-0.5 transition-colors"><X size={14} /></button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default SearchFilters;