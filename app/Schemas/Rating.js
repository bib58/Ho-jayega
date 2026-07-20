import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    rating: { type: Number, required: true },
    review: { type: String, required: true },
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    orderId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

ratingSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

const Rating = mongoose.models.Rating || mongoose.model("Rating", ratingSchema);
export default Rating;