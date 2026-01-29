"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

// Données initiales pour ne pas partir de zéro
const INITIAL_PRODUCTS = [
    { id: 1, name: "Montre Vintage", price: 120, tags: ["accessoire", "homme"], image: "https://via.placeholder.com/150", description: "Belle montre." },
    { id: 2, name: "Sac à main", price: 80, tags: ["accessoire", "femme"], image: "https://via.placeholder.com/150", description: "Cuir véritable." },
    // ... tu peux en ajouter d'autres
];

export const ShopProvider = ({ children }) => {
    // --- ÉTAT PRODUITS ---
    const [products, setProducts] = useState(() => {
        // Vérifier si nous sommes côté client avant d'accéder à localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('products');
            return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
        }
        return INITIAL_PRODUCTS;
    });

    // Sauvegarde auto dans LocalStorage (Simulation DB)
    useEffect(() => {
        // Vérifier si nous sommes côté client avant d'accéder à localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('products', JSON.stringify(products));
        }
    }, [products]);

    // --- ÉTAT FILTRES & PAGINATION ---
    const [selectedTags, setSelectedTags] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // --- ÉTAT PANIER ---
    const [cart, setCart] = useState([]);

    // --- LOGIQUE METIER ---

    // 1. Filtrage (Logique ET : Le produit doit avoir TOUS les tags sélectionnés)
    const filteredProducts = products.filter(product => {
        if (selectedTags.length === 0) return true;
        return selectedTags.every(tag => product.tags.includes(tag));
    });

    // 2. Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- ACTIONS ADMIN ---
    const addProduct = (product) => {
        const newProduct = { ...product, id: Date.now() }; // ID unique simple
        setProducts([...products, newProduct]);
    };

    const removeProduct = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const updateProduct = (updatedProduct) => {
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    // --- ACTIONS PANIER ---
    const addToCart = (product) => {
        setCart(prev => [...prev, product]); // Ajout simple (pas de quantité pour l'exemple)
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(p => p.id !== productId));
    };

    const clearCart = () => setCart([]);

    // --- ACTIONS FILTRES ---
    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
        setCurrentPage(1); // Reset page au changement de filtre
    };

    // Extraction de tous les tags uniques disponibles
    const availableTags = [...new Set(products.flatMap(p => p.tags))];

    return (
        <ShopContext.Provider value={{
            products, paginatedProducts, totalPages, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
            selectedTags, toggleTag, availableTags,
            cart, addToCart, removeFromCart, clearCart,
            addProduct, removeProduct, updateProduct
        }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => useContext(ShopContext);
