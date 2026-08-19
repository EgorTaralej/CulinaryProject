import { useState, useContext, useMemo } from 'react';
import { useLoaderData, useRevalidator, useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import { AuthContext } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Loader2, MapPin, Search, Clock, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export const profileLoader = async ({ params }) => {
    const url = params.id ? `/users/${params.id}` : '/users/me';
    const res = await api.get(url);
    return res.data;
};

const HorizontalRecipeCard = ({ recipe }) => {
    return (
        <Link to={`/recipe/${recipe._id}`} className="flex w-full gap-4 md:gap-6 py-6 border-b border-slate-100 hover:bg-slate-50/50 transition-all group">
            <div className="w-28 h-28 md:w-40 md:h-40 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                {recipe.mainImage ? (
                    <img src={recipe.mainImage} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold text-center p-2">Няма снимка</div>
                )}
            </div>

            <div className="flex flex-col justify-center flex-1 min-w-0">
                <h3 className="text-lg md:text-2xl font-black text-slate-950 line-clamp-1 mb-1 md:mb-2 group-hover:text-orange-500 transition-colors tracking-tight">
                    {recipe.title}
                </h3>
                
                <p className="text-slate-500 text-xs md:text-base line-clamp-2 leading-relaxed mb-3 md:mb-4 font-medium italic">
                    {recipe.ingredients?.join(' • ')}
                </p>

                <div className="flex items-center gap-4 text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5 border border-slate-100">
                            <AvatarImage src={recipe.author?.profileImage} />
                            <AvatarFallback className="text-[8px] bg-orange-100 text-orange-600">
                                {recipe.author?.username?.[0] || "?"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-slate-900">{recipe.author?.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={14} className="text-orange-500" /> 
                        <span>45 МИН.</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const Profile = () => {
    const data = useLoaderData();
    const profileData = data.user;
    const allUserRecipes = data.recipes || data.myRecipes || [];
    
    const { id } = useParams();
    const { user: loggedInUser } = useContext(AuthContext);
    const { toast } = useToast();
    const revalidator = useRevalidator();
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userListModal, setUserListModal] = useState({ isOpen: false, title: '', list: [] });
    
    const [bio, setBio] = useState(profileData?.bio || '');
    const [tempImg, setTempImg] = useState(profileData?.profileImage || '');

    const isMyProfile = !id || id === loggedInUser?.id;

    const openUserList = (type) => {
        const list = type === 'following' ? profileData.following : profileData.followers;
        const title = type === 'following' ? 'Следвани' : 'Последователи';
        setUserListModal({ isOpen: true, title, list: list || [] });
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await api.put('/users/update', { bio, profileImage: tempImg });
            setIsEditing(false);
            revalidator.revalidate();
            toast({ title: "Профилът е обновен!" });
        } catch (err) { toast({ variant: "destructive", title: "Грешка" }); }
        finally { setLoading(false); }
    };

    const filteredRecipes = useMemo(() => {
        return allUserRecipes.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allUserRecipes, searchQuery]);

    const filteredFavorites = useMemo(() => {
        return (profileData?.favorites || []).filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [profileData?.favorites, searchQuery]);

    return (
        <div className="w-full max-w-4xl mx-auto py-10 px-4">
            <div className="w-full flex flex-col items-start space-y-6 mb-16">
                <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                        <AvatarImage src={tempImg} className="object-cover" />
                        <AvatarFallback className="text-3xl font-black bg-slate-100">
                            {profileData?.username?.[0] || "?"}
                        </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer">
                            <Camera className="text-white" size={28} />
                            <input type="file" className="hidden" onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const formData = new FormData();
                                    formData.append('image', file);
                                    api.post('/upload', formData).then(res => setTempImg(res.data.imageUrl));
                                }
                            }} />
                        </label>
                    )}
                </div>

                <div className="w-full space-y-4">
                    <div className="flex justify-between items-start w-full">
                        <div>
                            <h1 className="text-4xl font-black text-slate-950 tracking-tight">{profileData?.username}</h1>
                            <p className="text-slate-400 font-bold">@{profileData?.username?.toLowerCase()}</p>
                        </div>
                        
                        {isMyProfile ? (
                            !isEditing ? (
                                <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-xl border-slate-200 font-bold px-6 shadow-none">Редактирай</Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button onClick={handleUpdate} disabled={loading} className="bg-orange-500 hover:bg-orange-600 rounded-xl font-bold px-6 shadow-none text-white">
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Запази"}
                                    </Button>
                                    <Button onClick={() => setIsEditing(false)} variant="ghost" className="rounded-xl font-bold shadow-none">Отказ</Button>
                                </div>
                            )
                        ) : (
                            <Button className="bg-slate-950 hover:bg-orange-500 text-white px-10 py-6 rounded-xl font-black text-lg shadow-none">Follow</Button>
                        )}
                    </div>

                    {isEditing ? (
                        <Textarea 
                            value={bio} 
                            onChange={(e) => setBio(e.target.value)} 
                            className="mt-4 w-full rounded-2xl bg-slate-50 border-none resize-none p-6 text-lg focus-visible:ring-orange-500" 
                            placeholder="Споделете нещо за себе си..."
                        />
                    ) : (
                        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl font-medium">{profileData?.bio || "Няма описание."}</p>
                    )}

                    <div className="flex gap-8 pt-2">
                        <button onClick={() => openUserList('following')} className="flex gap-2 items-center hover:opacity-70 transition-opacity">
                            <span className="font-black text-xl text-slate-950">{profileData?.following?.length || 0}</span>
                            <span className="text-slate-400 font-bold text-sm uppercase">Следвани</span>
                        </button>
                        <button onClick={() => openUserList('followers')} className="flex gap-2 items-center hover:opacity-70 transition-opacity">
                            <span className="font-black text-xl text-slate-950">{profileData?.followers?.length || 0}</span>
                            <span className="text-slate-400 font-bold text-sm uppercase">Последователи</span>
                        </button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="recipes" className="w-full block">
                <div className="w-full flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 mb-8 gap-4">
                    <TabsList className="flex bg-transparent h-auto p-0 gap-8 justify-start border-none shadow-none outline-none ring-0">
                        <TabsTrigger 
                            value="recipes" 
                            className="rounded-none bg-transparent px-0 pb-2 font-black text-lg text-slate-400 data-[state=active]:text-slate-950 data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border-none"
                        >
                            Рецепти ({allUserRecipes.length})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="favorites" 
                            className="rounded-none bg-transparent px-0 pb-2 font-black text-lg text-slate-400 data-[state=active]:text-slate-950 data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border-none"
                        >
                            Любими ({profileData?.favorites?.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full md:w-72 pb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <Input 
                            placeholder="Търси в профила..." 
                            className="w-full pl-10 h-10 bg-slate-50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-orange-500 shadow-none text-sm font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                
                <TabsContent value="recipes" className="w-full mt-0 outline-none block">
                    <div className="flex flex-col w-full">
                        {filteredRecipes.length > 0 ? (
                            filteredRecipes.map(r => <HorizontalRecipeCard key={r._id} recipe={r} />)
                        ) : (
                            <div className="py-20 text-center w-full text-slate-300 font-black text-xl italic">Няма открити рецепти.</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="favorites" className="w-full mt-0 outline-none block">
                    <div className="flex flex-col w-full">
                        {filteredFavorites.length > 0 ? (
                            filteredFavorites.map(r => <HorizontalRecipeCard key={r._id} recipe={r} />)
                        ) : (
                            <div className="py-20 text-center w-full text-slate-300 font-black text-xl uppercase tracking-tighter italic">Няма открити любими.</div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {userListModal.isOpen && (
                <div 
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
                    style={{ margin: 0 }}
                    onClick={() => setUserListModal({ ...userListModal, isOpen: false })}
                >
                    <div 
                        className="bg-white w-[90%] max-w-[360px] rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >

                        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
                            <h3 className="font-black text-lg text-slate-950">{userListModal.title}</h3>
                            <button 
                                onClick={() => setUserListModal({ ...userListModal, isOpen: false })} 
                                className="text-slate-400 hover:text-slate-950 transition-colors p-1"
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2 pt-0 scrollbar-hide">
                            <div className="space-y-0.5">
                                {userListModal.list.length > 0 ? userListModal.list.map(u => {
                                    if (!u || !u.username) return null;
                                    return (
                                        <Link 
                                            key={u._id} 
                                            to={`/profile/${u._id}`} 
                                            onClick={() => setUserListModal({ ...userListModal, isOpen: false })} 
                                            className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all group"
                                        >
                                            <Avatar className="w-10 h-10 border border-slate-100 group-hover:scale-105 transition-transform">
                                                <AvatarImage src={u.profileImage} />
                                                <AvatarFallback className="bg-orange-100 text-orange-600 font-bold uppercase">
                                                    {u.username[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-bold text-slate-900 group-hover:text-orange-500 transition-colors">
                                                {u.username}
                                            </span>
                                        </Link>
                                    );
                                }) : (
                                    <div className="py-10 text-center text-slate-400 font-bold italic text-sm">Списъкът е празен.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;