import AdminLayout from "../components/admin/AdminLayout";
import { Show, SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function RootAdminLayout({ children }) {
    return (
        <>
            <Show when="signed-in">
                <AdminLayout>
                    {children}
                </AdminLayout>
            </Show>
            <Show when="signed-out">
                <SignInButton mode="modal" fallbackRedirectUrl="/admin">
                </SignInButton>
            </Show>
        </>
    );
}
