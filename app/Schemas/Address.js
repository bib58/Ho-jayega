import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },

    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: false }
);

const Address = mongoose.models.Address || mongoose.model("Address", addressSchema);

export default Address;