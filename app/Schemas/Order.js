import mongoose from "mongoose";

export const OrderStatus = {
  ORDER_PLACED: "ORDER_PLACED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
};

export const PaymentMethod = {
  COD: "COD",
  STRIPE: "STRIPE",
};

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    total: { type: Number, required: true },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.ORDER_PLACED },
    userId: { type: String, required: true },
    storeId: { type: String, required: true },
    addressId: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    isCouponUsed: { type: Boolean, default: false },
    coupon: { type: mongoose.Schema.Types.Mixed, default: {} },
    orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    address: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;