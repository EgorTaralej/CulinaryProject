import { useState, useEffect } from 'react';
import api from '../services/api';
import RecipeCard from '../components/RecipeCard';

const Home = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const res = await api.get('/recipes');
                setRecipes(res.data);
            } catch (err) {
                console.error("Грешка при зареждане на рецептите");
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    if (loading) return <div className="text-center mt-20 font-bold text-gray-500">Зареждане...</div>;

    return (
        <div className="max-w-6xl mx-auto py-10">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-gray-800">Открий нещо <span className="text-red-600">вкусно</span></h1>
                <p className="text-gray-500 mt-2">Най-новите рецепти от нашата общност</p>
            </div>

            {recipes.length === 0 ? (
                <p className="text-center text-gray-400">Все още няма добавени рецепти.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recipes.map(recipe => (
                        <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;