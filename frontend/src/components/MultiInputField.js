import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const MultiInputField = ({ 
  label, 
  values = [], 
  onChange, 
  placeholder = '', 
  type = 'text',
  validation = null,
  maxItems = 10 
}) => {
  const addItem = () => {
    if (values.length < maxItems) {
      onChange([...values, '']);
    }
  };

  const removeItem = (index) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const updateItem = (index, value) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  const isValid = (value) => {
    if (!validation) return true;
    if (!value.trim()) return true; // Allow empty
    return validation(value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type={type}
              value={value}
              onChange={(e) => updateItem(index, e.target.value)}
              className={`form-input flex-1 ${!isValid(value) ? 'border-red-300 focus:border-red-500' : ''}`}
              placeholder={`${placeholder} ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="p-2 text-red-600 hover:text-red-700 transition-colors"
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {values.length === 0 && (
          <div className="flex items-center gap-2">
            <input
              type={type}
              value=""
              onChange={(e) => onChange([e.target.value])}
              className="form-input flex-1"
              placeholder={placeholder}
            />
          </div>
        )}

        {values.length < maxItems && (
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add {label.slice(0, -1)}
          </button>
        )}
      </div>
      
      {validation && values.some(v => v && !isValid(v)) && (
        <p className="text-xs text-red-600 mt-1">
          Please enter valid {label.toLowerCase()}
        </p>
      )}
    </div>
  );
};

export default MultiInputField;