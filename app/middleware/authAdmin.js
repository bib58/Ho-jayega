import { clerkClient } from "@clerk/nextjs/server"

async function authAdmin(userId) {
    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        const adminEmails = process.env.ADMIN_EMAIL
            .split(",")
            .map(email => email.trim());
        
        return adminEmails.includes(user.emailAddresses[0].emailAddress);
    } catch (err) {
        console.error("Error checking admin status:", err);
        return false;
    }
}

export default authAdmin;