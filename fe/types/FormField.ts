
export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea"; // Only these types
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
  placeholder?: string;
}