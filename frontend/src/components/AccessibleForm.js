import React from 'react';

export const FormField = ({ 
  label, 
  id, 
  type = 'text', 
  required = false, 
  error, 
  helpText,
  children,
  ...props 
}) => {
  const inputId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helpText ? `${inputId}-help` : undefined;

  return (
    <div className="mb-6">
      <label 
        htmlFor={inputId}
        className={`block text-sm font-medium mb-2 ${
          error ? 'text-red-700' : 'text-gray-700'
        }`}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      {children ? (
        React.cloneElement(children, {
          id: inputId,
          'aria-invalid': error ? 'true' : 'false',
          'aria-describedby': [errorId, helpId].filter(Boolean).join(' '),
          className: `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
            error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${children.props.className || ''}`.trim(),
          ...props
        })
      ) : (
        <input
          id={inputId}
          type={type}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[errorId, helpId].filter(Boolean).join(' ')}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
            error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          {...props}
        />
      )}
      
      {helpText && (
        <p id={helpId} className="mt-2 text-sm text-gray-600">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export const SubmitButton = ({ 
  children, 
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      aria-disabled={loading || disabled}
      className={`
        w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
        hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors outline-none
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </a>
  );
};

export const VisuallyHidden = ({ children, asChild = false, ...props }) => {
  const className = "sr-only";
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: `${children.props.className || ''} ${className}`.trim(),
      ...props
    });
  }
  
  return (
    <span className={className} {...props}>
      {children}
    </span>
  );
};

const AccessibleForm = ({ 
  children, 
  onSubmit, 
  title,
  description,
  className = '',
  ...props 
}) => {
  return (
    <form 
      onSubmit={onSubmit}
      className={`space-y-6 ${className}`}
      noValidate
      {...props}
    >
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      
      {children}
    </form>
  );
};

export default AccessibleForm;