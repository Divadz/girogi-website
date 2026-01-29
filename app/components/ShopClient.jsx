"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import FilterSidebar from './FilterSidebar';
import ProductCard from './ProductCard';
import { useShop } from '../context/ShopContext';

export default function ShopClient({ initialProducts, allTags }) {
    const [selectedTags, setSelectedTags] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Utiliser le panier depuis le ShopContext
    const { cart, addToCart } = useShop();

    // --- LOGIQUE DE FILTRAGE MULTI-TAGS ---
    const filteredProducts = useMemo(() => {
        if (selectedTags.length === 0) return initialProducts;

        // On garde les produits qui possèdent TOUS les tags sélectionnés
        return initialProducts.filter(product =>
            selectedTags.every(selectedTag =>
                product.tags.some(t => {
                    // Gérer les deux formats de tags
                    const tagLabel = typeof t === 'object' ? t.label : t;
                    const selectedTagLabel = typeof selectedTag === 'object' ? selectedTag.label : selectedTag;
                    return tagLabel === selectedTagLabel;
                })
            )
        );
    }, [selectedTags, initialProducts]);

    // --- LOGIQUE DE PAGINATION ---
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.some(t => {
                const prevLabel = typeof t === 'object' ? t.label : t;
                const tagLabel = typeof tag === 'object' ? tag.label : tag;
                return prevLabel === tagLabel;
            })
                ? prev.filter(t => {
                    const prevLabel = typeof t === 'object' ? t.label : t;
                    const tagLabel = typeof tag === 'object' ? tag.label : tag;
                    return prevLabel !== tagLabel;
                })
                : [...prev, tag]
        );
        setCurrentPage(1); // Reset page quand on filtre
    };

    return (
        <div className="flex">
            {/* Barre latérale avec catégories : Thème, Couleur, Type */}
            <FilterSidebar
                availableTags={allTags}
                selectedTags={selectedTags}
                onToggle={toggleTag}
            />

            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Nos Produits ({filteredProducts.length})</h1>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">Afficher :</span>
                        {[12, 24, 36].map(num => (
                            <button
                                key={num}
                                onClick={() => {setItemsPerPage(num); setCurrentPage(1);}}
                                className={`px-3 py-1 rounded ${itemsPerPage === num ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grille de produits */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                        />
                    ))}
                </div>

                {/* Boutons de Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-12">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-white border-gray-600'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Mini Panier flottant pour commander */}
            {cart.length > 0 && (
                <Link 
                    href="/cart" 
                    className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer hover:bg-blue-700"
                >
                    🛒 <span>{cart.length} produit{cart.length > 1 ? 's' : ''}</span>
                </Link>
            )}
        </div>
    );
}
