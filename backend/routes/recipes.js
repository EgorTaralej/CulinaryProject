const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Recipe = require('../models/Recipe');

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

module.exports = router;