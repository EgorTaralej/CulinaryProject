const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Comment = require('../models/Comment');

router.get('/search/ingredients', async (req, res) => {
    try {
        const { include, exclude } = req.query;
        let query = {};

        if (include) {
            const includeArray = include.split(',').map(s => s.trim());
            query.ingredients = { $all: includeArray };
        }

        if (exclude) {
            const excludeArray = exclude.split(',').map(s => s.trim());
            if (!query.ingredients) {
                query.ingredients = { $nin: excludeArray };
            } else {
                query.ingredients.$nin = excludeArray;
            }
        }

        const recipes = await Recipe.find(query).populate('author', ['username']);
        res.json(recipes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/feed', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const recipes = await Recipe.find({ author: { $in: user.following } })
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
        const { title, description, ingredients, steps, category, videoUrl } = req.body;

        const newRecipe = new Recipe({
            title,
            description,
            ingredients,
            steps,
            category,
            videoUrl,
            author: req.user.id
        });

        const recipe = await newRecipe.save();
        res.status(201).json(recipe);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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

router.post('/:id/comment', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        const newComment = new Comment({
            text: req.body.text,
            author: req.user.id,
            recipe: req.params.id
        });

        const comment = await newComment.save();
        res.status(201).json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/:id/rate', auth, async (req, res) => {
    try {
        const { stars } = req.body;
        if (stars < 1 || stars > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        const existingRating = recipe.ratings.find(r => r.user.toString() === req.user.id);

        if (existingRating) {
            existingRating.stars = stars;
        } else {
            recipe.ratings.push({ user: req.user.id, stars });
        }

        const totalStars = recipe.ratings.reduce((sum, r) => sum + r.stars, 0);
        recipe.averageRating = totalStars / recipe.ratings.length;

        await recipe.save();
        res.json({ averageRating: recipe.averageRating, ratingsCount: recipe.ratings.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;