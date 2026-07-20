import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        image_url: { type: String, required: true },
        cart: { type: mongoose.Schema.Types.Mixed, default: {} },

        ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
        Address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
        store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", default: null },
        buyerOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;