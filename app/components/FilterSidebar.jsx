export default function FilterSidebar({ availableTags, selectedTags, onToggle }) {
    const categories = ["type", "thème", "couleur"];

    return (
        <aside className="w-64 p-4 bg-gray-900 border-r border-gray-700 h-screen sticky top-0">
            <h2 className="font-bold text-xl mb-6">Filtrer par :</h2>
            {categories.map(cat => (
                <div key={cat} className="mb-6">
                    <h3 className="font-semibold text-gray-300 mb-2 capitalize">{cat}</h3>
                    <div className="space-y-1">
                        {availableTags.filter(t => t.category === cat).map(tag => (
                            <label key={tag.label} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedTags.some(st => st.label === tag.label)}
                                    onChange={() => onToggle(tag)}
                                    className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-300">{tag.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </aside>
    );
}