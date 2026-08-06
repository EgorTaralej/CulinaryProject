import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';

const CreateRecipe = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState(['']);
    const [steps, setSteps] = useState([{ text: '', image: '' }]);
    const [category, setCategory] = useState({ cuisine: 'Българска', diet: 'Стандартна', difficulty: 'Лесно' });
    const [videoUrl, setVideoUrl] = useState('');

    const addIngredient = () => setIngredients([...ingredients, '']);
    const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

    const addStep = () => setSteps([...steps, { text: '', image: '' }]);
    const removeStep = (index) => setSteps(steps.filter((_, i) => i !== index));

    const handleImageUpload = async (index, file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await api.post('/upload', formData);
            const newSteps = [...steps];
            newSteps[index].image = res.data.imageUrl;
            setSteps(newSteps);
        } catch (err) {
            console.error(err);
            alert('Грешка при качване на снимката');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/recipes', { title, description, ingredients, steps, category, videoUrl });
            navigate('/');
        } catch (err) {
            alert('Грешка при създаване на рецептата');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-black text-gray-800 mb-8">Сподели нова <span className="text-red-600">рецепта</span></h1>
            
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl shadow-sm border">
                {/* Основна информация */}
                <div className="space-y-4">
                    <input type="text" placeholder="Заглавие на рецептата" className="w-full text-2xl font-bold border-b-2 border-gray-100 focus:border-red-500 outline-none pb-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <textarea placeholder="Кратко описание..." className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-red-500" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>

                {/* Съставки */}
                <div>
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Plus size={18}/> Съставки</h3>
                    {ingredients.map((ing, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input type="text" className="flex-1 p-2 bg-gray-50 rounded-lg outline-none" value={ing} onChange={(e) => {
                                const newIngs = [...ingredients];
                                newIngs[index] = e.target.value;
                                setIngredients(newIngs);
                            }} required />
                            <button type="button" onClick={() => removeIngredient(index)} className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                        </div>
                    ))}
                    <button type="button" onClick={addIngredient} className="text-sm font-bold text-red-600 mt-2 hover:underline">+ Добави съставка</button>
                </div>

                {/* Стъпки */}
                <div>
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Plus size={18}/> Начин на приготвяне</h3>
                    {steps.map((step, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-2xl mb-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="font-black text-gray-300">СТЪПКА {index + 1}</span>
                                <button type="button" onClick={() => removeStep(index)} className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                            </div>
                            <textarea className="w-full p-2 bg-white rounded-lg outline-none" value={step.text} onChange={(e) => {
                                const newSteps = [...steps];
                                newSteps[index].text = e.target.value;
                                setSteps(newSteps);
                            }} required />
                            
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border hover:bg-gray-100 transition">
                                    <Upload size={16} />
                                    <span className="text-sm font-medium">{step.image ? 'Сменете снимката' : 'Качете снимка'}</span>
                                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(index, e.target.files[0])} />
                                </label>
                                {step.image && <img src={step.image} className="w-12 h-12 rounded-lg object-cover border" alt="preview" />}
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addStep} className="text-sm font-bold text-red-600 hover:underline">+ Добави стъпка</button>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xl hover:bg-red-700 transition shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : 'ПУБЛИКУВАЙ РЕЦЕПТАТА'}
                </button>
            </form>
        </div>
    );
};

export default CreateRecipe;