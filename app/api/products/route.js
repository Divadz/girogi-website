import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
    const products = await prisma.product.findMany({ include: { tags: true } });
    return NextResponse.json(products);
}

export async function POST(req) {
    // Protection de la route
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    try {
        const formData = await req.formData();
        
        const name = formData.get('name');
        const description = formData.get('description');
        const price = formData.get('price');
        const imageFile = formData.get('image');
        const tagsString = formData.get('tags');
        
        console.log('Données reçues:', { name, description, price, imageFile: imageFile?.name, tagsString });

        // Validation des données requises
        if (!name || !description || !price) {
            return NextResponse.json({ error: "Nom, description et prix sont requis" }, { status: 400 });
        }

        let tags = [];
        if (tagsString) {
            try {
                tags = JSON.parse(tagsString);
            } catch (e) {
                return NextResponse.json({ error: "Format des tags invalide" }, { status: 400 });
            }
        }

        let imagePath = null;
        
        // Gérer l'upload de l'image
        if (imageFile && imageFile.size > 0) {
            try {
                const bytes = await imageFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                
                // Générer un nom de fichier unique
                const timestamp = Date.now();
                const filename = `${timestamp}-${imageFile.name}`;
                const path = join(process.cwd(), 'public', 'uploads', filename);
                
                // Écrire le fichier
                await writeFile(path, buffer);
                imagePath = `/uploads/${filename}`;
                console.log('Image sauvegardée:', imagePath);
            } catch (fileError) {
                console.error('Erreur lors de la sauvegarde du fichier:', fileError);
                return NextResponse.json({ error: "Erreur lors de l'upload de l'image" }, { status: 500 });
            }
        }

        console.log('Création du produit avec:', { name, description, price, imagePath, tags });
        
        const product = await prisma.product.create({
            data: {
                name, 
                description, 
                price: parseFloat(price), 
                image: imagePath,
                tags: {
                    connectOrCreate: tags.map(t => ({
                        where: { label: t.label },
                        create: { label: t.label, category: t.category }
                    }))
                }
            }
        });
        
        console.log('Produit créé:', product);
        return NextResponse.json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ 
            error: "Erreur lors de la création du produit: " + error.message 
        }, { status: 500 });
    }
}

export async function DELETE(req) {
    // Protection de la route
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID du produit requis" }, { status: 400 });
        }

        // Récupérer le produit pour supprimer l'image associée si nécessaire
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
        }

        // Supprimer le produit (les relations tags seront supprimées automatiquement)
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        // Optionnel: supprimer l'image fichier si elle existe et n'est pas une URL externe
        if (product.image && product.image.startsWith('/uploads/')) {
            try {
                const fs = require('fs').promises;
                const imagePath = join(process.cwd(), 'public', product.image);
                await fs.unlink(imagePath);
                console.log('Image supprimée:', imagePath);
            } catch (fileError) {
                console.warn('Impossible de supprimer l\'image:', fileError);
                // Ne pas échouer la suppression si l'image ne peut être supprimée
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ 
            error: "Erreur lors de la suppression du produit: " + error.message 
        }, { status: 500 });
    }
}
