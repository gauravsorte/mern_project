const mongoose = require("mongoose");
const {
    ObjectId
} = mongoose.Schema;

const productSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 30
    },
    description: {
        type: String,
        trim: true,
        required: true,
        maxlength: 30
    },
    price: {
        type: Number,
        required: true,
        maxlength: 30,
        trim: true
    },
    category: {
        type: ObjectId,
        ref: "Category",
        required: true
    },
    stock: {
        type: Number
    },
    soldUnit: {
        type: Number,
        default: 0
    },
    photo: {
        data: Buffer,
        contentType: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Product", productSchema);