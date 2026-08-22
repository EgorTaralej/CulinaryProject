const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Recipe = require('../models/Recipe');
const Report = require('../models/Report');
const User = require('../models/User');

router.get('/dashboard', [auth, admin], async (req, res) => {
    try {
        const reports = await Report.find({ status: 'pending' })
            .populate({
                path: 'recipe',
                populate: { path: 'author', select: 'username email profileImage' }
            })
            .populate('reporter', ['username', 'email', 'profileImage'])
            .sort({ createdAt: -1 });

        const pendingRecipes = await Recipe.find({ status: 'pending' })
            .populate('author', ['username', 'email', 'profileImage']);

        res.json({ reports, pendingRecipes });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.put('/recipe/:id/approve', [auth, admin], async (req, res) => {
    try {
        await Recipe.findByIdAndUpdate(req.params.id, { status: 'approved' });
        res.json({ message: "Рецептата е одобрена!" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.put('/user/:id/block', [auth, admin], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ message: user.isBlocked ? "Потребителят е блокиран" : "Потребителят е отблокиран" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.delete('/recipe/:id', [auth, admin], async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        await Report.updateMany({ recipe: req.params.id }, { status: 'resolved' });
        res.json({ message: "Рецептата е изтрита" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.put('/report/:id/resolve', [auth, admin], async (req, res) => {
    try {
        await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' });
        res.json({ message: "Сигналът е архивиран" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;