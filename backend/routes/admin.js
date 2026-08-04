const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Recipe = require('../models/Recipe');
const Report = require('../models/Report');

router.get('/reports', [auth, admin], async (req, res) => {
    try {
        const reports = await Report.find({ status: 'pending' })
            .populate('recipe')
            .populate('reporter', ['username'])
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.delete('/recipe/:id', [auth, admin], async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        await Recipe.findByIdAndDelete(req.params.id);
        
        await Report.updateMany({ recipe: req.params.id }, { status: 'resolved' });

        res.json({ message: "Recipe deleted by admin" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;