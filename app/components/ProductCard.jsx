import React from 'react';
import Image from 'next/image';
import { useShop } from '../context/ShopContext';

export default function ProductCard({ product, isAdmin = false }) {
    const { addToCart, removeProduct } = useShop();

    return (
        <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-gray-800 border-gray-700">
            <Image 
                src={product.image} 
                alt={product.name} 
                width={300}
                height={192}
                className="w-full h-48 object-cover rounded mb-4" 
            />
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-gray-400 text-sm mb-2">{product.description}</p>
            <div className="flex flex-wrap gap-1 mb-2">
                {product.tags.map(tag => {
                    // Gérer les deux formats: objet {id, label} ou string
                    const tagLabel = typeof tag === 'object' ? tag.label : tag;
                    const tagKey = typeof tag === 'object' ? tag.id : tag;
                    
                    return (
                        <span key={tagKey} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">
                            {tagLabel}
                        </span>
                    );
                })}
            </div>
            <div className="flex justify-between items-center mt-4">
                <span className="font-bold text-xl">{product.price} €</span>

                {isAdmin ? (
                    <button
                        onClick={() => removeProduct(product.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Supprimer
                    </button>
                ) : (
                    <button
                        onClick={() => addToCart(product)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                        Ajouter
                    </button>
                )}
            </div>
        </div>
    );
}
