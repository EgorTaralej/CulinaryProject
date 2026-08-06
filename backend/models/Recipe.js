const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    mainImage: {
        type: String,
        default: ""
    },
    ingredients: [{
        type: String,
        required: true
    }],
    steps: [{
        text: { type: String, required: true },
        image: { type: String, default: "" }
    }],
    category: {
        cuisine: { type: String, required: true },
        diet: { type: String, required: true },
        difficulty: { type: String, required: true }
    },
    videoUrl: {
        type: String,
        default: ""
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ratings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        stars: { type: Number, min: 1, max: 5 }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    isReported: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);