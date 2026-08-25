import { useState, useContext } from 'react';
import { useLoaderData } from 'react-router-dom';
import api from '@/services/api';
import { AuthContext } from '@/context/AuthContext';
import RecipeCard from '@/components/RecipeCard';
import SearchFilters from '@/components/SearchFilters';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Users } from 'lucide-react';

export const homeLoader = async () => {
    const token = localStorage.getItem('token');

    const [recipesRes, categoriesRes] = await Promise.all([
        api.get('/recipes'),
        api.get('/categories')
    ]);

    let feedRecipes = [];

    if (token) {
        try {
            const feedRes = await api.get('/recipes/feed');
            feedRecipes = feedRes.data;
        } catch (err) {
            console.log("Guest mode or session expired");
        }
    }

    return {
        recipes: recipesRes.data,
        categories: categoriesRes.data,
        feedRecipes: feedRecipes
    };
};

const Home = () => {
    const { recipes, categories, feedRecipes } = useLoaderData();
    const { toast } = useToast();
    const { user } = useContext(AuthContext);
    const [displayRecipes, setDisplayRecipes] = useState(recipes);
    const [loading, setLoading] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);
    const [usedAdvanced, setUsedAdvanced] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

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
            setActiveTab('all');
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
            {user ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full !flex !flex-col">
                    <div className="w-full flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 mb-8 gap-6">
                        <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-auto border-none inline-flex w-fit shadow-none outline-none">
                            <TabsTrigger value="all" className="rounded-xl px-6 py-3 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-orange-500 shadow-none focus-visible:ring-0">
                                <LayoutGrid size={18} className="mr-2" /> За теб
                            </TabsTrigger>
                            <TabsTrigger value="following" className="rounded-xl px-6 py-3 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-orange-500 shadow-none focus-visible:ring-0">
                                <Users size={18} className="mr-2" /> Следвани
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                                {activeTab === 'all'
                                    ? (isFiltered ? "Резултати от търсенето" : "Всички рецепти")
                                    : "От последвани автори"}
                                <span className="text-slate-300 ml-3 font-bold">
                                    ({activeTab === 'all' ? displayRecipes.length : feedRecipes.length})
                                </span>
                            </h2>
                        
                            {isFiltered && !usedAdvanced && activeTab === 'all' && (
                                <button onClick={handleClear} className="text-sm font-bold text-orange-600 hover:text-slate-950 transition-colors">
                                    ✕ Изчисти търсенето
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        <TabsContent value="all" className="w-full mt-0 outline-none border-none shadow-none">
                            {displayRecipes.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {displayRecipes.map(recipe => (
                                        <RecipeCard key={recipe._id} recipe={recipe} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-slate-300 font-bold uppercase italic text-xl">Няма открити рецепти.</div>
                            )}
                        </TabsContent>

                        <TabsContent value="following" className="w-full mt-0 outline-none border-none shadow-none">
                            {feedRecipes.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {feedRecipes.map(recipe => (
                                        <RecipeCard key={recipe._id} recipe={recipe} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 text-center bg-slate-50 rounded-[3.5rem] border-4 border-dashed border-slate-100 px-6">
                                    <p className="text-slate-400 font-black text-2xl uppercase tracking-tight mb-3 italic">Още няма нищо тук</p>
                                    <p className="text-slate-400 text-lg font-medium italic">Последвай любимите си автори, за да виждаш рецептите им тук.</p>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            ) : (
                <div className="space-y-8 mt-10">
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight border-b border-slate-100 pb-6">
                        Всички рецепти <span className="text-slate-300 ml-3">({displayRecipes.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {displayRecipes.map(recipe => (
                            <RecipeCard key={recipe._id} recipe={recipe} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;