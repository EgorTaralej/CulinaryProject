const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Recipe = require('../models/Recipe');

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