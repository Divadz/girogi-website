"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (result.error) {
            setError("Identifiants invalides");
        } else {
            router.push("/admin");
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-black">
            <form onSubmit={handleSubmit} className="p-8 bg-gray-900 text-white shadow-xl rounded-lg w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <input
                    type="text"
                    placeholder="Identifiant"
                    className="w-full p-2 border rounded mb-4 bg-gray-800 text-white border-gray-700"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full p-2 border rounded mb-6 bg-gray-800 text-white border-gray-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                    Se connecter
                </button>
            </form>
        </div>
    );
}