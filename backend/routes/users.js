const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.put('/follow/:id', auth, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow) return res.status(404).json({ message: "User not found" });
        
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        if (currentUser.following.includes(req.params.id)) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user.id);
            
            await currentUser.save();
            await userToFollow.save();
            return res.json({ message: "Unfollowed successfully" });
        }

        currentUser.following.push(req.params.id);
        userToFollow.followers.push(req.user.id);

        await currentUser.save();
        await userToFollow.save();

        res.json({ message: "Followed successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/favorite/:recipeId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user.favorites.includes(req.params.recipeId)) {
            user.favorites = user.favorites.filter(id => id.toString() !== req.params.recipeId);
            await user.save();
            return res.json({ message: "Removed from favorites" });
        }

        user.favorites.push(req.params.recipeId);
        await user.save();
        res.json({ message: "Added to favorites" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;