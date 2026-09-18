import { AppSidebar } from "./app-sidebar";
import Header from "./Header";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";

const MainLayout = ({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) => {
    return (
        <SidebarProvider style={{ "--sidebar-width": "250px" } as React.CSSProperties}>
            <AppSidebar />
            <SidebarInset className="flex flex-col flex-1 min-w-0 min-h-screen">
                <Header />
                <main className="p-4 flex-1 overflow-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default MainLayout;