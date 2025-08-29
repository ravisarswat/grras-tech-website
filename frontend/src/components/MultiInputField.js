import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const MultiInputField = ({ 
  label, 
  items = [], 
  onUpdate, 
  placeholder = "Add item",
  maxItems = null,
  inputType = "text",
  validation = null
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      setError('Value cannot be empty');
      return;
    }
    
    if (maxItems && items.length >= maxItems) {
      setError(`Maximum ${maxItems} items allowed`);
      return;
    }
    
    if (validation) {
      const validationError = validation(trimmedValue, items);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    
    // Check for duplicates
    if (items.includes(trimmedValue)) {
      setError('This item already exists');
      return;
    }
    
    onUpdate([...items, trimmedValue]);
    setInputValue('');
    setError('');
  };

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onUpdate(newItems);
  };

  const handleMove = (index, direction) => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      onUpdate(newItems);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} {maxItems && `(${items.length}/${maxItems})`}
      </label>
      
      {/* Display existing items */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
              
              <div className="flex-1 text-sm text-gray-700">
                {item}
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  type="button"
                >
                  ↑
                </button>
                
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === items.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  type="button"
                >
                  ↓
                </button>
                
                <button
                  onClick={() => handleRemove(index)}
                  className="p-1 text-red-400 hover:text-red-600"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add new item */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type={inputType}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            placeholder={placeholder}
            className={`form-input flex-1 ${error ? 'border-red-300' : ''}`}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          
          <button
            onClick={handleAdd}
            className="btn-outline px-4"
            type="button"
            disabled={!inputValue.trim() || (maxItems && items.length >= maxItems)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};

export default MultiInputField;