"use client";
import { useState, useEffect } from 'react';
import TagInput from './components/TagInput';
import TagManager from './components/TagManager';

export default function AdminPage() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        image: null, // Changé de string à File object
        tags: [] // Tableau d'objets { label, category }
    });

    // Charger les produits au démarrage
    useEffect(() => {
        fetch('/api/products').then(res => res.json()).then(setProducts);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Créer FormData pour l'upload de fichier
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('price', form.price);
        if (form.image) {
            formData.append('image', form.image);
        }
        formData.append('tags', JSON.stringify(form.tags));

        const res = await fetch('/api/products', {
            method: 'POST',
            body: formData, // Utiliser FormData au lieu de JSON
        });

        if (res.ok) {
            const newProduct = await res.json();
            setProducts([...products, newProduct]);
            setForm({ name: '', description: '', price: '', image: null, tags: [] });
            alert("Produit ajouté !");
        } else {
            const errorData = await res.json();
            alert(`Erreur: ${errorData.error || 'Erreur inconnue'}`);
        }
    };

    const deleteProduct = async (id) => {
        if (!confirm("Supprimer ce produit ?")) return;
        
        try {
            const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
            
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
                alert("Produit supprimé avec succès");
            } else {
                const errorData = await res.json();
                alert(`Erreur: ${errorData.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            alert('Erreur lors de la suppression du produit');
            console.error(error);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Gestion du Catalogue</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORMULAIRE D'AJOUT */}
                <form onSubmit={handleSubmit} className="lg:col-span-1 bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-sm h-fit">
                    <h2 className="text-xl font-semibold mb-4">Nouveau Produit</h2>
                    <div className="space-y-4">
                        <input
                            placeholder="Nom du produit" required
                            className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600"
                            value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        />
                        <textarea
                            placeholder="Description" required
                            className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600"
                            value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                        />
                        <input
                            type="number" step="0.01" placeholder="Prix (€)" required
                            className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600"
                            value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600"
                            onChange={e => setForm({...form, image: e.target.files[0]})}
                        />

                        <hr className="my-4" />
                        <p className="text-sm font-bold text-gray-400 uppercase">Tags par catégorie</p>

                        {/* Saisie intelligente pour chaque catégorie */}
                        <TagInput
                            category="type"
                            selectedTags={form.tags}
                            onTagsChange={(newTags) => setForm({...form, tags: newTags})}
                        />
                        <TagInput
                            category="thème"
                            selectedTags={form.tags}
                            onTagsChange={(newTags) => setForm({...form, tags: newTags})}
                        />
                        <TagInput
                            category="couleur"
                            selectedTags={form.tags}
                            onTagsChange={(newTags) => setForm({...form, tags: newTags})}
                        />

                        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">
                            Enregistrer le produit
                        </button>
                    </div>
                </form>

                {/* LISTE DES PRODUITS */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Produits en ligne ({products.length})</h2>
                    <div className="overflow-x-auto border rounded-lg border-gray-700">
                        <table className="w-full text-left bg-gray-900">
                            <thead className="bg-gray-800 border-b border-gray-700">
                            <tr>
                                <th className="p-3">Produit</th>
                                <th className="p-3">Prix</th>
                                <th className="p-3">Tags</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {products.map(p => (
                                <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="p-3 font-medium">{p.name}</td>
                                    <td className="p-3">{p.price} €</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-1">
                                            {p.tags?.map(t => (
                                                <span key={t.id} className="text-[10px] bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded">{t.label}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => deleteProduct(p.id)}
                                            className="text-red-500 hover:underline text-sm"
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* SECTION GESTION DES TAGS */}
            <div className="mt-12">
                <TagManager />
            </div>
        </div>
    );
}
