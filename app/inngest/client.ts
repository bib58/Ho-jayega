import { Inngest } from "inngest";
import User from "../Schemas/User";
import Coupon from "../Schemas/Coupon";
import mongoose from "mongoose";
import connectDB from "../middleware/connectDB";

export const inngest = new Inngest({ id: "cart-hub" });

const syncUserCreation = inngest.createFunction(
    { id: "saving-user-to-database", triggers: [{ event: "clerk/user.created" }] },
    async ({ event }) => {
        await connectDB();
        const userData = event.data ?? {};
        const name = `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim();
        const email = userData.email_addresses?.[0]?.email_address ?? "";

        await User.create({
            id: userData.id,
            name: name,
            email: email,
            image_url: userData.image_url ?? "",
            cart: {},
        });
    }
);

const syncUserUpdation = inngest.createFunction(
    { id: "updating-user-in-database", triggers: [{ event: "clerk/user.updated" }] },
    async ({ event }) => {
        await connectDB();
        const userData = event.data ?? {};
        const name = `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim();
        const email = userData.email_addresses?.[0]?.email_address ?? "";
        const image_url = userData.image_url ?? "";

        await User.findOneAndUpdate(
            { id: userData.id },
            { name, email, image_url },
            { new: true, upsert: true },
        );
    }
);

const syncUserDeletion = inngest.createFunction(
    { id: "deleting-user-from-database", triggers: [{ event: "clerk/user.deleted" }] },
    async ({ event }) => {
        await connectDB();
        const userData = event.data ?? {};
        await User.findOneAndDelete({ id: userData.id });
    }
);

const deleteCoupon = inngest.createFunction(
    { id: "delete-expired-coupon", triggers: [{ event: "coupon-created" }] },
    async ({ event, step }) => {
        const { couponId } = event.data;

        const coupon = await step.run("fetch-coupon", async () => {
            await connectDB();
            return await Coupon.findById(couponId).lean();
        });

        if (!coupon)
            return;

        await step.sleepUntil("wait-for-coupon-expiry", new Date(coupon.expiresAt));
        await step.run("delete-coupon", async () => {
            await connectDB();
            await Coupon.findByIdAndDelete(couponId);
        });
    }
);

export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion, deleteCoupon];
