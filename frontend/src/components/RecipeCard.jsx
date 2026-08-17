import { Star, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const RecipeCard = ({ recipe }) => {
    return (
        <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-white">
            {/* Снимка */}
            <div className="relative h-52 overflow-hidden">
                {recipe.mainImage ? (
                    <img 
                        src={recipe.mainImage} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                        Няма снимка
                    </div>
                )}
                <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-orange-600 hover:bg-white border-none backdrop-blur-sm font-bold">
                        {recipe.category.difficulty}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-1">
                        {recipe.title}
                    </h3>
                    <div className="flex items-center text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                        <Star size={14} fill="currentColor" />
                        <span className="ml-1 text-xs">{recipe.averageRating.toFixed(1)}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-5 pt-0 pb-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-orange-600">
                        <User size={12} />
                    </div>
                    <span className="font-medium">{recipe.author?.username}</span>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
                <Button asChild className="w-full bg-slate-50 hover:bg-orange-600 hover:text-white text-slate-700 border-none shadow-none rounded-xl font-bold transition-colors">
                    <Link to={`/recipe/${recipe._id}`} className="flex items-center justify-center gap-2">
                        Виж рецептата <ChevronRight size={16} />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RecipeCard;