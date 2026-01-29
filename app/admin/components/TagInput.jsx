"use client";
import { useState, useEffect, useRef } from 'react';

export default function TagInput({ category, selectedTags, onTagsChange }) {
    const [query, setQuery] = useState("");
    const [allTags, setAllTags] = useState([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    // Charger tous les tags existants pour cette catégorie
    useEffect(() => {
        fetch(`/api/tags?category=${category}`)
            .then(res => res.json())
            .then(setAllTags);
    }, [category]);

    // Filtrer les suggestions en fonction de la saisie
    useEffect(() => {
        if (query.trim() === '') {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = allTags.filter(tag => 
            tag.label.toLowerCase().includes(query.toLowerCase()) &&
            !selectedTags.some(selected => selected.label === tag.label)
        );
        
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
    }, [query, allTags, selectedTags]);

    const createNewTag = async (label) => {
        setLoading(true);
        try {
            const res = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label, category })
            });

            if (res.ok) {
                const newTag = await res.json();
                setAllTags([...allTags, newTag]);
                return newTag;
            } else {
                const error = await res.json();
                return { error: error.error };
            }
        } catch (error) {
            console.error('Erreur lors de la création du tag:', error);
            alert(`Erreur: ${error.message}`);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const addTag = async (label) => {
        if (!label.trim() || selectedTags.find(t => t.label === label)) {
            return;
        }

        // Vérifier si le tag existe déjà
        const existingTag = allTags.find(t => t.label === label);
        
        let tagToAdd;
        if (existingTag) {
            tagToAdd = existingTag;
        } else {
            // Créer le tag s'il n'existe pas
            tagToAdd = await createNewTag(label);
            if (!tagToAdd || tagToAdd.error) {
                // Afficher l'erreur si présente
                if (tagToAdd?.error) {
                    alert(`Erreur: ${tagToAdd.error}`);
                }
                return; // Erreur lors de la création
            }
        }

        onTagsChange([...selectedTags, tagToAdd]);
        setQuery("");
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (query.trim()) {
                addTag(query.trim());
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setQuery("");
        } else if (e.key === 'ArrowDown' && showSuggestions) {
            e.preventDefault();
            // Navigation avec les flèches (à implémenter si besoin)
        }
    };

    const handleSuggestionClick = (suggestion) => {
        addTag(suggestion.label);
    };

    const handleCreateNew = () => {
        if (query.trim()) {
            addTag(query.trim());
        }
    };

    // Clique en dehors pour fermer les suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="mb-4 p-3 border rounded bg-gray-900 border-gray-700 shadow-sm" ref={inputRef}>
            <label className="block text-sm font-bold mb-2 uppercase text-gray-400">Catégorie: {category}</label>
            
            {/* Tags sélectionnés */}
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.filter(t => t.category === category).map(t => (
                    <span key={t.label} className="bg-blue-900 text-blue-300 px-2 py-1 rounded flex items-center gap-1">
                        {t.label}
                        <button 
                            onClick={() => onTagsChange(selectedTags.filter(st => st.label !== t.label))}
                            className="text-blue-400 hover:text-white"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>

            {/* Champ de saisie avec suggestions */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
                    placeholder={`Ajouter un tag ${category}...`}
                    className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600"
                    disabled={loading}
                />

                {/* Suggestions dropdown */}
                {showSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg max-h-40 overflow-y-auto">
                        {filteredSuggestions.map(suggestion => (
                            <div
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white flex items-center justify-between"
                            >
                                <span>{suggestion.label}</span>
                                <span className="text-xs text-gray-400">Existant</span>
                            </div>
                        ))}
                        
                        {/* Option pour créer un nouveau tag */}
                        {query.trim() && !filteredSuggestions.some(s => s.label.toLowerCase() === query.toLowerCase()) && (
                            <div
                                onClick={handleCreateNew}
                                className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-green-400 flex items-center justify-between border-t border-gray-600"
                            >
                                <span>Créer &quot;{query.trim()}&quot;</span>
                                <span className="text-xs">Nouveau</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Indicateur de chargement */}
            {loading && (
                <div className="mt-2 text-sm text-gray-400">
                    Création du tag en cours...
                </div>
            )}
        </div>
    );
}
