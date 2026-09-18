import { AppSidebar } from "../components/app-sidebar";
import { CreateShortUrl } from "../components/create-short-url";
import MainLayout from "../components/main-layout";
import { SidebarTrigger, SidebarProvider } from "../components/ui/sidebar";


export default function Homepage({ children }: { children: React.ReactNode }) {
    return (
        <MainLayout title={''} description={''}>
            <CreateShortUrl />
        </MainLayout>
    )
}