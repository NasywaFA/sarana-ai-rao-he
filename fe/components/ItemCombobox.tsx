"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ItemType } from "@/types/ItemType";
import { searchItems } from "@/services/itemService";
import toast from "react-hot-toast";

interface ItemCombobox {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function ItemCombobox({
  value,
  onChange,
  placeholder = "Search items...",
  label,
  required = false,
  disabled = false,
  className = ""
}: ItemCombobox) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced search function
  const performSearch = useCallback(async (search: string) => {
    if (!search.trim()) {
      // Load initial items when search is empty
      try {
        setLoading(true);
        const response = await searchItems("", 1, 100);
        if (response.isSuccess) {
          setItems(response.data || []);
        } else {
          toast.error(response.message || "Failed to load items");
        }
      } catch (error) {
        console.error("Error loading items:", error);
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const response = await searchItems(search, 1, 100);
      if (response.isSuccess) {
        setItems(response.data || []);
      } else {
        toast.error(response.message || "Failed to search items");
      }
    } catch (error) {
      console.error("Error searching items:", error);
      toast.error("Failed to search items");
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
      performSearch(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, performSearch]);

  // Load initial items when component mounts
  useEffect(() => {
    if (isOpen) {
      performSearch("");
    }
  }, [isOpen, performSearch]);

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
        setHighlightedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && items[highlightedIndex]) {
          handleSelectItem(items[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelectItem = (item: ItemType) => {
    setSelectedItem(item);
    onChange(item.id!);
    setSearchTerm(`${item.code} - ${item.name}`);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // If user clears the input, reset selection
    if (!newValue) {
      setSelectedItem(null);
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
    if (selectedItem) {
      return `${selectedItem.code} - ${selectedItem.name}`;
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
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm ? "No items found" : "No items available"}
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                  index === highlightedIndex ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleSelectItem(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="font-medium">{item.code}</div>
                <div className="text-gray-600">{item.name}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}