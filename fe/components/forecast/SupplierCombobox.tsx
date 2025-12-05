"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SupplierType } from "@/types/SupplierType";
import { getSuppliersForItem } from "@/services/supplierService";
import toast from "react-hot-toast";

interface SupplierComboboxProps {
  itemId: string;
  value: string;
  onChange: (value: string) => void;
  onSupplierSelect: (supplier: SupplierType | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function SupplierCombobox({
  itemId,
  value,
  onChange,
  onSupplierSelect,
  placeholder = "Search suppliers...",
  label,
  required = false,
  disabled = false,
  className = ""
}: SupplierComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierType | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load suppliers for the specific item
  const loadSuppliers = useCallback(async (search: string = "") => {
    try {
      if (itemId === "") {
        setSuppliers([]);
        return;
      }

      setLoading(true);
      const response = await getSuppliersForItem(itemId, search);
      if (response.isSuccess) {
        const fullSuppliers = response.data.map(supplierItem => {
          return supplierItem.supplier!;
        });

        setSuppliers(fullSuppliers);
      } else {
        toast.error(response.message || "Failed to load suppliers");
        setSuppliers([]);
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
      toast.error("Failed to load suppliers");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadSuppliers(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, loadSuppliers]);

  // Load suppliers when component mounts or itemId changes
  useEffect(() => {
    if (isOpen) {
      loadSuppliers(searchTerm);
    }
  }, [isOpen, loadSuppliers, searchTerm]);

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
          prev < suppliers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && suppliers[highlightedIndex]) {
          handleSelectSupplier(suppliers[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelectSupplier = (supplier: SupplierType) => {
    setSelectedSupplier(supplier);
    onChange(supplier.id);
    onSupplierSelect(supplier);
    setSearchTerm(supplier.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // If user clears the input, reset selection
    if (!newValue) {
      setSelectedSupplier(null);
      onChange("");
      onSupplierSelect(null);
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
    if (selectedSupplier) {
      return selectedSupplier.name;
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
            <div className="px-3 py-2 text-sm text-gray-500">Loading suppliers...</div>
          ) : suppliers.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm ? "No suppliers found" : "No suppliers available for this item"}
            </div>
          ) : (
            suppliers.map((supplier, index) => (
              <div
                key={supplier.id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                  index === highlightedIndex ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleSelectSupplier(supplier)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="font-medium">{supplier.name}</div>
                <div className="text-gray-600">{supplier.address}</div>
                <div className="text-xs text-gray-500">
                  {supplier.phone_number} • {supplier.whatsapp_number}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 