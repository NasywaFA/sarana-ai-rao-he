"use client";
import { useState } from "react";
import { CreateWasteLogPayload } from "@/types/WasteLogType";

interface AddWasteLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWasteLogPayload) => Promise<void>;
}

const initialForm: CreateWasteLogPayload = {
  date: new Date().toISOString().split('T')[0],
  waste_type: "",
  waste_quantity: 1,
  note: "",
  recipe_id: undefined,
};

export default function AddWasteLogModal({ isOpen, onClose, onSubmit }: AddWasteLogModalProps) {
  const [form, setForm] = useState<CreateWasteLogPayload>(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.date) errs.date = "Date is required";
    if (!form.waste_type) errs.waste_type = "Waste type is required";
    if (!form.waste_quantity || form.waste_quantity <= 0) errs.waste_quantity = "Quantity must be positive";
    if (form.waste_type === "other" && !form.note) errs.note = "Note is required for 'other' type";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field: keyof CreateWasteLogPayload, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(form);
      setForm(initialForm);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(initialForm);
    setErrors({});
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add Waste Log</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" value={form.date} onChange={e => handleChange("date", e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? "border-red-300" : "border-gray-300"}`} />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type *</label>
            <select value={form.waste_type} onChange={e => handleChange("waste_type", e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.waste_type ? "border-red-300" : "border-gray-300"}`}>
              <option value="">Select type</option>
              <option value="expired">Expired</option>
              <option value="damaged">Damaged</option>
              <option value="other">Other (Specify in note)</option>
            </select>
            {errors.waste_type && <p className="mt-1 text-sm text-red-600">{errors.waste_type}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input type="number" value={form.waste_quantity} onChange={e => handleChange("waste_quantity", e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.waste_quantity ? "border-red-300" : "border-gray-300"}`} />
            {errors.waste_quantity && <p className="mt-1 text-sm text-red-600">{errors.waste_quantity}</p>}
          </div>
          {
            form.waste_type === "other" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note {form.waste_type === "other" ? "*" : "(optional)"}</label>
                <textarea value={form.note} onChange={e => handleChange("note", e.target.value)} rows={2} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.note ? "border-red-300" : "border-gray-300"}`} placeholder="Enter note if needed" />
                {errors.note && <p className="mt-1 text-sm text-red-600">{errors.note}</p>}
              </div>
            )
          }
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? "Saving..." : "Add Log"}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 