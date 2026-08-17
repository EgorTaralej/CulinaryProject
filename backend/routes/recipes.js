const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Report = require('../models/Report');

router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 });
        res.json(recipes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { title, description, mainImage, ingredients, steps, category, videoUrl } = req.body;

        const newRecipe = new Recipe({
            title,
            description,
            mainImage,
            ingredients,
            steps,
            category,
            videoUrl,
            author: req.user.id
        });

        const recipe = await newRecipe.save();
        res.status(201).json(recipe);
    } catch (err) {
        console.error("err.message");
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
        res.json({ averageRating: recipe.averageRating });
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
        const populated = await Comment.findById(newComment._id).populate('author', ['username']);
        res.status(201).json(populated);
    } catch (err) {
        console.error("Error in POST /comment:", err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('author', ['username']);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        const comments = await Comment.find({ recipe: req.params.id })
            .populate('author', ['username'])
            .sort({ createdAt: -1 });

        res.json({ recipe, comments });
    } catch (err) {
        console.error("Error in GET /:id:", err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: "Invalid ID" });
        res.status(500).send('Server Error');
    }
});

router.get('/search/advanced', async (req, res) => {
    try {
        const { q, cuisine, diet, difficulty, include, exclude } = req.query;
        let query = {};

        const getStem = (word) => word.trim().toLowerCase().replace(/[еаия]$/, '');

        if (q) {
            const stem = getStem(q);
            query.$or = [
                { title: { $regex: stem, $options: 'i' } },
                { ingredients: { $regex: stem, $options: 'i' } }
            ];
        }

        if (cuisine && cuisine !== 'Всички') query['category.cuisine'] = cuisine;
        if (diet && diet !== 'Всички') query['category.diet'] = diet;
        if (difficulty && difficulty !== 'Всички') query['category.difficulty'] = difficulty;

        if (include) {
            const includeStems = include.split(',').map(s => new RegExp(getStem(s), 'i'));
            query.ingredients = { ...query.ingredients, $all: includeStems };
        }

        if (exclude) {
            const excludeStems = exclude.split(',').map(s => new RegExp(getStem(s), 'i'));
            query.ingredients = { ...query.ingredients, $nin: excludeStems };
        }

        const recipes = await Recipe.find(query).populate('author', ['username']).sort({ createdAt: -1 });
        res.json(recipes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});
module.exports = router;