import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },

    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: false }
);

orderItemSchema.index({ orderId: 1, productId: 1 }, { unique: true });

const OrderItem = mongoose.models.OrderItem || mongoose.model("OrderItem", orderItemSchema);
export default OrderItem;