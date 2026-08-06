import { Star, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Снимка на рецептата */}
            <div className="h-48 overflow-hidden bg-gray-200">
                {recipe.steps.find(s => s.image) ? (
                    <img 
                        src={recipe.steps.find(s => s.image).image} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Няма снимка
                    </div>
                )}
            </div>

            {/* Информация */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">
                        {recipe.title}
                    </h3>
                    <div className="flex items-center text-yellow-500 font-bold">
                        <Star size={16} fill="currentColor" />
                        <span className="ml-1 text-sm">{recipe.averageRating.toFixed(1)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                    <span className="flex items-center gap-1">
                        <User size={14} /> {recipe.author?.username}
                    </span>
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">
                        {recipe.category.difficulty}
                    </span>
                </div>

                <Link 
                    to={`/recipe/${recipe._id}`}
                    className="block w-full text-center py-2 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-colors"
                >
                    Виж рецептата
                </Link>
            </div>
        </div>
    );
};

export default RecipeCard;