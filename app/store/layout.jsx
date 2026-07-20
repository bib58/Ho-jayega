import StoreLayout from "../components/store/StoreLayout";
import { Show, SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function RootAdminLayout({ children }) {
    return (
        <>
            <Show when="signed-in">
                <StoreLayout>
                    {children}
                </StoreLayout>
            </Show>
            <Show when="signed-out">
                <SignInButton mode="modal" fallbackRedirectUrl="/store">
                </SignInButton>
            </Show>
        </>
    );
}
