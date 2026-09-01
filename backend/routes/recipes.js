const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Report = require('../models/Report');

router.get('/', async (req, res) => {
    try {
        const blockedUsers = await User.find({ isBlocked: true }).select('_id');
        const blockedIds = blockedUsers.map(u => u._id);

        const recipes = await Recipe.find({
            status: 'approved',
            author: { $nin: blockedIds }
        })
            .populate('author', ['username', 'profileImage'])
            .sort({ createdAt: -1 });
        res.json(recipes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.get('/search/advanced', async (req, res) => {
    try {
        const blockedUsers = await User.find({ isBlocked: true }).select('_id');
        const blockedIds = blockedUsers.map(u => u._id);

        const { q, cuisine, diet, difficulty, dishType, include, exclude } = req.query;
        let query = {
            status: 'approved',
            author: { $nin: blockedIds }
        };

        const getStem = (word) => word.trim().toLowerCase().replace(/[еаия]$/, '');

        if (q) {
            const stem = getStem(q);
            query.$or = [
                { title: { $regex: stem, $options: 'i' } },
                { ingredients: { $regex: stem, $options: 'i' } }
            ];
        }

        if (cuisine && cuisine !== 'Всички') query['category.cuisine'] = cuisine;
        if (diet && diet !== 'Всички') {
            if (diet === 'Без диета') {
                query['category.diet'] = { $in: ["", null] };
            } else {
                query['category.diet'] = diet;
            }
        } if (difficulty && difficulty !== 'Всички') query['category.difficulty'] = difficulty;
        if (dishType && dishType !== 'Всички') {
            query['category.dishType'] = dishType;
        }

        if (include) {
            const includeStems = include.split(',').map(s => new RegExp(getStem(s), 'i'));
            query.ingredients = { ...query.ingredients, $all: includeStems };
        }

        if (exclude) {
            const excludeStems = exclude.split(',').map(s => new RegExp(getStem(s), 'i'));
            query.ingredients = { ...query.ingredients, $nin: excludeStems };
        }

        const recipes = await Recipe.find(query)
            .populate('author', ['username', 'profileImage'])
            .sort({ createdAt: -1 });
        res.json(recipes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.get('/feed', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const following = user.following || [];

        const recipes = await Recipe.find({
            author: { $in: following },
            status: 'approved'
        })
            .populate('author', ['username', 'profileImage'])
            .sort({ createdAt: -1 });

        res.json(recipes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/:id/report', auth, async (req, res) => {
    try {
        const { reason } = req.body;

        const newReport = new Report({
            recipe: req.params.id,
            reporter: req.user.id,
            reason: reason || "Потребителски сигнал",
            status: 'pending'
        });

        await newReport.save();

        await Recipe.findByIdAndUpdate(req.params.id, { isReported: true });

        res.status(201).json({ message: "Сигналът е приет" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('author', ['username', 'profileImage']);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        const token = req.header('x-auth-token');
        let isAuthorized = false;

        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.id === recipe.author._id.toString() || decoded.role === 'admin') {
                    isAuthorized = true;
                }
            } catch (err) { }
        }

        if (recipe.status !== 'approved' && !isAuthorized) {
            return res.status(403).json({ message: "Тази рецепта е в процес на модерация." });
        }

        const comments = await Comment.find({ recipe: req.params.id })
            .populate('author', ['username', 'profileImage'])
            .sort({ createdAt: -1 });

        res.json({ recipe, comments });
    } catch (err) {
        console.error("Error in GET /:id:", err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: "Invalid ID" });
        res.status(500).send('Server Error');
    }
});

router.post('/:id/rate', auth, async (req, res) => {
    try {
        const { stars } = req.body;
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        const existingRating = recipe.ratings.find(r => r.user.toString() === req.user.id);
        if (existingRating) existingRating.stars = stars;
        else recipe.ratings.push({ user: req.user.id, stars });

        const totalStars = recipe.ratings.reduce((sum, r) => sum + r.stars, 0);
        recipe.averageRating = totalStars / recipe.ratings.length;

        await recipe.save();
        res.json({
            averageRating: recipe.averageRating,
            ratings: recipe.ratings
        });
    } catch (err) {
        console.error("Error in POST /rate:", err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/:id/comment', auth, async (req, res) => {
    try {
        const newComment = new Comment({
            text: req.body.text,
            author: req.user.id,
            recipe: req.params.id
        });

        await newComment.save();
        const populated = await Comment.findById(newComment._id).populate('author', ['username', 'profileImage']);
        res.status(201).json(populated);
    } catch (err) {
        console.error("Error in POST /comment:", err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { title, description, mainImage, ingredients, steps, category, videoUrl, prepTime, cookTime, servings } = req.body;
        const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';
        const newRecipe = new Recipe({
            title,
            description,
            mainImage,
            ingredients,
            steps,
            category,
            videoUrl,
            prepTime,
            cookTime,
            servings,
            author: req.user.id,
            status: initialStatus
        });

        const recipe = await newRecipe.save();
        res.status(201).json(recipe);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        let recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Не е намерена" });
        
        if (recipe.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Нямате права за редакцията" });
        }

        const newStatus = req.user.role === 'admin' ? 'approved' : 'pending';

        recipe = await Recipe.findByIdAndUpdate(
            req.params.id, 
            { $set: { ...req.body, status: newStatus } },
            { new: true }
        );
        res.json(recipe);
    } catch (err) { 
        res.status(500).send('Server Error'); 
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: "Рецептата не е намерена." });
        }

        if (recipe.author.toString() !== req.user.id) {
            return res.status(401).json({ message: "Нямате права за това действие." });
        }

        await Recipe.findByIdAndDelete(req.params.id);

        await Report.updateMany({ recipe: req.params.id }, { status: 'resolved' });

        await Comment.deleteMany({ recipe: req.params.id });

        res.json({ message: "Рецептата беше изтрита успешно." });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;