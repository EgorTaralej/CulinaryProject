import { useLoaderData } from 'react-router-dom';
import api from '@/services/api';
import CreateRecipe from './CreateRecipe';

export const editRecipeLoader = async ({ params }) => {
    const [recipeRes, categoriesRes] = await Promise.all([
        api.get(`/recipes/${params.id}`),
        api.get('/categories')
    ]);
    return {
        recipe: recipeRes.data.recipe,
        categories: categoriesRes.data
    };
};

const EditRecipe = () => {
    const data = useLoaderData();
    return <CreateRecipe initialData={data.recipe} key={data.recipe._id} />;
};

export default EditRecipe;