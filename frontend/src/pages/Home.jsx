import { useLoaderData } from 'react-router-dom';
import api from '@/services/api';
import RecipeCard from '@/components/RecipeCard';

export const homeLoader = async () => {
    const res = await api.get('/recipes');
    return res.data;
};

const Home = () => {
    const recipes = useLoaderData();

    return (
        <div className="max-w-6xl mx-auto py-10">
            <h1 className="text-4xl font-black text-center mb-12">Открий нещо <span className="text-red-600">вкусно</span></h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recipes.map(recipe => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
            </div>
        </div>
    );
};

export default Home;