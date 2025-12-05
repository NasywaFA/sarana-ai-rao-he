"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BranchType } from "@/types/BranchType";
import { getBranches } from "@/services/branchesService";
import toast from "react-hot-toast";

interface BranchesComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onBranchSelect: (branch: BranchType | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function BranchesCombobox({
  value,
  onChange,
  onBranchSelect,
  placeholder = "Search branches...",
  label,
  required = false,
  disabled = false,
  className = ""
}: BranchesComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedBranch, setSelectedBranch] = useState<BranchType | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load branches
  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBranches();
      if (response.isSuccess) {
        setBranches(response.data);
      } else {
        toast.error(response.message || "Failed to load branches");
        setBranches([]);
      }
    } catch (error) {
      console.error("Error loading branches:", error);
      toast.error("Failed to load branches");
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect (no search term, just load all branches)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadBranches();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [loadBranches]);

  // Load branches when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadBranches();
    }
  }, [isOpen, loadBranches]);

  // Set selected branch if value changes
  useEffect(() => {
    if (value && branches.length > 0) {
      const found = branches.find(branch => branch.id === value);
      setSelectedBranch(found || null);
    } else if (!value) {
      setSelectedBranch(null);
    }
  }, [value, branches]);

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
        setHighlightedIndex(prev => prev < branches.length - 1 ? prev + 1 : prev);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && branches[highlightedIndex]) {
          handleSelectBranch(branches[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelectBranch = (branch: BranchType) => {
    setSelectedBranch(branch);
    onChange(branch.id);
    onBranchSelect(branch);
    setSearchTerm(branch.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    // If user clears the input, reset selection
    if (!newValue) {
      setSelectedBranch(null);
      onChange("");
      onBranchSelect(null);
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
    if (selectedBranch) {
      return selectedBranch.name;
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
            <div className="px-3 py-2 text-sm text-gray-500">Loading branches...</div>
          ) : branches.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm ? "No branches found" : "No branches available"}
            </div>
          ) : (
            branches.map((branch, index) => (
              <div
                key={branch.id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${index === highlightedIndex ? 'bg-blue-100' : ''}`}
                onClick={() => handleSelectBranch(branch)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="font-medium">{branch.name}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 