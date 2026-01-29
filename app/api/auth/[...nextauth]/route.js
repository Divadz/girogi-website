import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Admin Access",
            credentials: {
                username: { label: "Identifiant", type: "text" },
                password: { label: "Mot de passe", type: "password" }
            },
            async authorize(credentials) {
                // Vérification par rapport au fichier .env
                if (
                    credentials.username === process.env.ADMIN_USER &&
                    credentials.password === process.env.ADMIN_PASS
                ) {
                    return { id: "1", name: "Admin" };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: '/login', // On définit notre propre page de login
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };