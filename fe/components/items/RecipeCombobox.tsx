"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { RecipeType } from "@/types/RecipeType";
import { getRecipes } from "@/services/recipeService";
import toast from "react-hot-toast";

interface RecipeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function RecipeCombobox({
  value,
  onChange,
  placeholder = "Search recipes...",
  label,
  required = false,
  disabled = false,
  className = ""
}: RecipeComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeType | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced fetch function
  const fetchRecipes = useCallback(async (search: string) => {
    try {
      setLoading(true);
      // Fetch a large enough page to cover most cases
      const response = await getRecipes(1, 100, "");
      if (response.isSuccess) {
        let filtered = response.data;
        if (search.trim()) {
          const lower = search.toLowerCase();
          filtered = filtered.filter(r =>
            r.code.toLowerCase().includes(lower) ||
            r.name.toLowerCase().includes(lower)
          );
        }
        setRecipes(filtered);
      } else {
        toast.error(response.message || "Failed to load recipes");
        setRecipes([]);
      }
    } catch (error) {
      console.error("Error loading recipes:", error);
      toast.error("Failed to load recipes");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchRecipes(searchTerm);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchRecipes]);

  // Load initial recipes when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchRecipes("");
    }
  }, [isOpen, fetchRecipes]);

  // Set selected recipe if value changes
  useEffect(() => {
    if (value && recipes.length > 0) {
      const found = recipes.find(recipe => recipe.id === value);
      setSelectedRecipe(found || null);
    } else if (!value) {
      setSelectedRecipe(null);
    }
  }, [value, recipes]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => prev < recipes.length - 1 ? prev + 1 : prev);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && recipes[highlightedIndex]) {
          handleSelectRecipe(recipes[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelectRecipe = (recipe: RecipeType) => {
    setSelectedRecipe(recipe);
    onChange(recipe.id!);
    setSearchTerm(`${recipe.code} - ${recipe.name}`);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    // If user clears the input, reset selection
    if (!newValue) {
      setSelectedRecipe(null);
      onChange("");
    }
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow for clicks on dropdown items
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  const getDisplayValue = () => {
    if (selectedRecipe) {
      return `${selectedRecipe.code} - ${selectedRecipe.name}`;
    }
    return searchTerm;
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={getDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading recipes...</div>
          ) : recipes.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm ? "No recipes found" : "No recipes available"}
            </div>
          ) : (
            recipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                  index === highlightedIndex ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleSelectRecipe(recipe)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="font-medium">{recipe.code}</div>
                <div className="text-gray-600">{recipe.name}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
