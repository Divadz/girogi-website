import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }) {
    const session = await getServerSession();

    if (!session) {
        redirect("/login"); // Redirection si non connecté
    }

    return (
        <div className="min-h-screen bg-black">
            <nav className="bg-gray-800 text-white p-4">
                <div className="container mx-auto flex justify-between">
                    <span className="font-bold">Panel Administration</span>
                    <Link href="/api/auth/signout" className="text-sm underline">Déconnexion</Link>
                </div>
            </nav>
            <main>{children}</main>
        </div>
    );
}