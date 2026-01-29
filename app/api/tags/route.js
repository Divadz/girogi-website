import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const tags = await prisma.tag.findMany({
        where: category ? { category: category } : {},
        orderBy: { label: 'asc' }
    });

    return NextResponse.json(tags);
}

export async function POST(req) {
    // Protection de la route
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    try {
        const { label, category } = await req.json();

        // Validation
        if (!label || !category) {
            return NextResponse.json({ error: "Label et category sont requis" }, { status: 400 });
        }

        // Vérifier si le tag existe déjà
        const existingTag = await prisma.tag.findUnique({
            where: { label }
        });

        if (existingTag) {
            return NextResponse.json({ error: "Ce tag existe déjà" }, { status: 400 });
        }

        const tag = await prisma.tag.create({
            data: { label, category }
        });

        return NextResponse.json(tag);
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json({ error: "Erreur lors de la création du tag" }, { status: 500 });
    }
}

export async function PUT(req) {
    // Protection de la route
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    try {
        const { id, label, category } = await req.json();

        // Validation
        if (!id || !label || !category) {
            return NextResponse.json({ error: "ID, label et category sont requis" }, { status: 400 });
        }

        // Vérifier si le nouveau label existe déjà (pour un autre tag)
        const existingTag = await prisma.tag.findFirst({
            where: { 
                label: label,
                id: { not: id }
            }
        });

        if (existingTag) {
            return NextResponse.json({ error: "Ce tag existe déjà" }, { status: 400 });
        }

        const tag = await prisma.tag.update({
            where: { id: parseInt(id) },
            data: { label, category }
        });

        return NextResponse.json(tag);
    } catch (error) {
        console.error('Error updating tag:', error);
        return NextResponse.json({ error: "Erreur lors de la mise à jour du tag" }, { status: 500 });
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
            return NextResponse.json({ error: "ID est requis" }, { status: 400 });
        }

        // Vérifier si le tag est utilisé par des produits
        const tagWithProducts = await prisma.tag.findUnique({
            where: { id: parseInt(id) },
            include: { products: true }
        });

        if (tagWithProducts.products.length > 0) {
            return NextResponse.json({ 
                error: `Impossible de supprimer ce tag, il est utilisé par ${tagWithProducts.products.length} produit(s)` 
            }, { status: 400 });
        }

        await prisma.tag.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json({ error: "Erreur lors de la suppression du tag" }, { status: 500 });
    }
}
