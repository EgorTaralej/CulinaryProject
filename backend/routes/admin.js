const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Recipe = require('../models/Recipe');
const Report = require('../models/Report');
const User = require('../models/User');
const Comment = require('../models/Comment');

router.get('/dashboard', [auth, admin], async (req, res) => {
    try {
        const reports = await Report.find({ status: 'pending' })
            .populate({
                path: 'recipe',
                populate: { path: 'author', select: 'username email profileImage' }
            })
            .populate('reporter', ['username', 'email', 'profileImage'])
            .sort({ createdAt: -1 });

        const pendingRecipes = await Recipe.find({ status: 'pending' }).populate('author', ['username', 'email', 'profileImage']);
        const recipesWithUpdates = await Recipe.find({ hasPendingUpdates: true }).populate('author', ['username', 'email', 'profileImage']);
        const blockedUsers = await User.find({ isBlocked: true }).select('username email profileImage createdAt');

        res.json({ reports, pendingRecipes, recipesWithUpdates, blockedUsers });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/recipe/:id/approve', [auth, admin], async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        if (recipe.hasPendingUpdates && recipe.pendingUpdates) {
            const newValues = JSON.parse(JSON.stringify(recipe.pendingUpdates));
            delete newValues._id;
            recipe.set(newValues);
            recipe.pendingUpdates = null;
            recipe.hasPendingUpdates = false;
        }

        recipe.status = 'approved';
        await recipe.save();
        res.json({ message: "Рецептата и промените бяха одобрени успешно!" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.put('/recipe/:id/reject-update', [auth, admin], async (req, res) => {
    try {
        await Recipe.findByIdAndUpdate(req.params.id, { pendingUpdates: null, hasPendingUpdates: false }, { returnDocument: 'after' });
        res.json({ message: "Отхвърлени промени." });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/user/:id/block', [auth, admin], async (req, res) => {
    try {
        if (req.params.id === req.user.id) return res.status(400).json({ message: "Не можете да блокирате себе си!" });
        const { reportId } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.isBlocked = true;
        await user.save();

        await Recipe.updateMany({ author: user._id }, { status: 'blocked' });
        await User.updateMany({}, { $pull: { followers: user._id, following: user._id } });
        if (reportId) {
            await Report.findByIdAndUpdate(reportId, { status: 'resolved' }, { returnDocument: 'after' });
        }

        res.json({ message: "Потребителят е блокиран и рецептите му са скрити." });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.put('/user/:id/unblock', [auth, admin], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Потребителят не е намерен" });

        user.isBlocked = false;
        await user.save();

        await Recipe.updateMany({ author: user._id, status: 'blocked' }, { status: 'approved' });

        res.json({ message: "Потребителят е разблокиран и рецептите му са възстановени." });
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

router.delete('/comment/:id', [auth, admin], async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: "Коментарът е премахнат" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.delete('/user/:id', [auth, admin], async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        await Recipe.deleteMany({ author: req.params.id });
        res.json({ message: "Потребителят и данните му са изтрити" });
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