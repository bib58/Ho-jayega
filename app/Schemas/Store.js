import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    status: { type: String, default: "pending" },
    isActive: { type: Boolean, default: false },
    logo: {
      url: { type: String, required: true },
      fileId: { type: String, required: true },
    },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Store = mongoose.models.Store || mongoose.model("Store", storeSchema);
export default Store;