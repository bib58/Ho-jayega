import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true },
    description: { type: String, required: true },
    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    images: [
      {
        url: { type: String, required: true },
        fileId: { type: String, required: true, },
      },
    ],
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store"},
    orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }],
    rating: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;