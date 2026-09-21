import { CreateShortUrl } from "../components/create-short-url";
import MainLayout from "../components/main-layout";

export default function Homepage() {
    return (
        <MainLayout>
            <CreateShortUrl />
        </MainLayout>
    )
}