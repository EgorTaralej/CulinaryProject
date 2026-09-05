import { Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const RecipeCard = ({ recipe }) => {
    return (
        <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-white">
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
                <div className="flex justify-between items-start gap-2">
                    <div className="h-12 flex-1 flex items-start min-w-0 pt-1">
                        <h3 className="text-[17px] font-bold text-slate-800 leading-tight line-clamp-2 break-all overflow-wrap-anywhere">
                            {recipe.title}
                        </h3>
                    </div>

                    <div className="flex items-center text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded-lg shrink-0 mt-1">
                        <Star size={13} fill="currentColor" />
                        <span className="ml-1 text-[11px]">{recipe.averageRating.toFixed(1)}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-5 pt-0 pb-4">
                <Link to={`/profile/${recipe.author._id}`} className="flex items-center gap-2 text-slate-500 text-sm hover:text-orange-500 transition-colors w-fit">
                    <Avatar className="w-6 h-6 border border-slate-100">
                        <AvatarImage src={recipe.author.profileImage} />
                        <AvatarFallback className="text-[10px] bg-orange-100 text-orange-600">{recipe.author.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold">{recipe.author?.username}</span>
                </Link>
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