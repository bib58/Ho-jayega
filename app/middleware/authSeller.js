import connectDB from "./connectDB";
import User from "../Schemas/User";
import Store from "../Schemas/Store";

const authSeller = async (userId) => {
    try {
        await connectDB();
        if (!userId) return null;

        const user = await User.findOne({ id: userId });
        if (!user || !user.store) {
            return null;
        }

        const store = await Store.findById(user.store);
        if (!store || store.status !== "approved") {
            return null;
        }

        return user.store; // This is a Mongoose ObjectId
    } catch (err) {
        console.error("authSeller error:", err);
        return null;
    }
};

export default authSeller;
