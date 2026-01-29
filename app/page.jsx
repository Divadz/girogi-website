import { prisma } from '@/lib/prisma';
import ShopClient from './components/ShopClient';

//const prisma = new PrismaClient();

export default async function HomePage() {
    // Chargement des données côté serveur (Performance & SEO)
    const products = await prisma.product.findMany({
        include: { tags: true },
    });

    const tags = await prisma.tag.findMany();

    return (
        <main className="min-h-screen bg-black">
            <ShopClient initialProducts={products} allTags={tags} />
        </main>
    );
}