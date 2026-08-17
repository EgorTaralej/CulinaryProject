import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import api from '@/services/api';
import RecipeCard from '@/components/RecipeCard';
import SearchFilters from '@/components/SearchFilters';
import { useToast } from "@/hooks/use-toast";

export const homeLoader = async () => {
    const [recipesRes, categoriesRes] = await Promise.all([
        api.get('/recipes'),
        api.get('/categories')
    ]);
    return { recipes: recipesRes.data, categories: categoriesRes.data };
};

const Home = () => {
    const { recipes, categories } = useLoaderData();
    const { toast } = useToast();
    const [displayRecipes, setDisplayRecipes] = useState(recipes);
    const [loading, setLoading] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);
    const [usedAdvanced, setUsedAdvanced] = useState(false);

    const handleSearch = async (filters) => {
        const hasAdvanced = filters.includeTags.length > 0 || 
                           filters.excludeTags.length > 0 || 
                           filters.cuisine !== 'Всички' || 
                           filters.diet !== 'Всички' || 
                           filters.difficulty !== 'Всички';

        if (!filters.query && !hasAdvanced) {
            handleClear();
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.query) params.append('q', filters.query);
            if (filters.cuisine !== 'Всички') params.append('cuisine', filters.cuisine);
            if (filters.diet !== 'Всички') params.append('diet', filters.diet);
            if (filters.difficulty !== 'Всички') params.append('difficulty', filters.difficulty);
            if (filters.includeTags.length > 0) params.append('include', filters.includeTags.join(','));
            if (filters.excludeTags.length > 0) params.append('exclude', filters.excludeTags.join(','));

            const res = await api.get(`/recipes/search/advanced?${params.toString()}`);
            setDisplayRecipes(res.data);
            setIsFiltered(true);
            setUsedAdvanced(hasAdvanced);
        } catch (err) {
            toast({ variant: "destructive", title: "Грешка при търсене" });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchQuery('');
        setDisplayRecipes(recipes);
        setIsFiltered(false);
        setUsedAdvanced(false);
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="mb-16 text-center">
                <h1 className="text-5xl font-black text-slate-950 tracking-tight mb-10">
                    Открий нещо <span className="text-orange-500 italic">вкусно</span>
                </h1>
                
                <SearchFilters 
                    categories={categories} 
                    onSearch={handleSearch} 
                    loading={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onReset={handleClear}
                />
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black text-slate-950">
                        {isFiltered ? "Резултати от търсенето" : "Всички рецепти"} 
                        <span className="text-slate-300 ml-2">({displayRecipes.length})</span>
                    </h2>
                    
                    {isFiltered && !usedAdvanced && (
                        <button 
                            onClick={handleClear}
                            className="text-sm font-bold text-orange-600 hover:text-slate-950 transition-colors"
                        >
                            ✕ Изчисти търсенето
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {displayRecipes.map(recipe => (
                        <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;