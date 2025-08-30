import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ExternalLink, Info, AlertCircle } from 'lucide-react';
import MultiInputField from './MultiInputField';

const FooterTab = ({ content, updateContent }) => {
  const [activeSection, setActiveSection] = useState('columns');
  
  const footer = content?.footer || {
    columns: [
      {
        id: 'quick-links',
        title: 'Quick Links',
        links: [
          { label: 'About Us', href: '/about', target: '_self' },
          { label: 'Courses', href: '/courses', target: '_self' },
          { label: 'Admissions', href: '/admissions', target: '_self' },
          { label: 'Contact', href: '/contact', target: '_self' }
        ]
      }
    ],
    popularCourses: {
      source: 'auto', // 'auto' or 'manual'
      limit: 5,
      manualCourses: []
    },
    legal: {
      copyright: '© 2024 GRRAS Solutions Training Institute. All rights reserved.',
      privacyPolicy: '/privacy-policy',
      terms: '/terms-of-service'
    },
    branding: {
      tagline: 'Empowering Futures Through Technology'
    }
  };

  const updateFooter = (field, value) => {
    const updatedFooter = { ...footer, [field]: value };
    updateContent('footer', updatedFooter);
  };

  const addColumn = () => {
    const newColumn = {
      id: `column-${Date.now()}`,
      title: 'New Column',
      links: []
    };
    updateFooter('columns', [...footer.columns, newColumn]);
  };

  const updateColumn = (columnIndex, field, value) => {
    const updatedColumns = [...footer.columns];
    updatedColumns[columnIndex] = { ...updatedColumns[columnIndex], [field]: value };
    updateFooter('columns', updatedColumns);
  };

  const deleteColumn = (columnIndex) => {
    const updatedColumns = footer.columns.filter((_, index) => index !== columnIndex);
    updateFooter('columns', updatedColumns);
  };

  const moveColumn = (columnIndex, direction) => {
    const updatedColumns = [...footer.columns];
    const targetIndex = direction === 'up' ? columnIndex - 1 : columnIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < updatedColumns.length) {
      [updatedColumns[columnIndex], updatedColumns[targetIndex]] = 
      [updatedColumns[targetIndex], updatedColumns[columnIndex]];
      updateFooter('columns', updatedColumns);
    }
  };

  const addLinkToColumn = (columnIndex, link) => {
    if (link.label.trim() && link.href.trim()) {
      const updatedColumns = [...footer.columns];
      updatedColumns[columnIndex].links = [
        ...updatedColumns[columnIndex].links,
        { ...link, target: link.target || '_self' }
      ];
      updateFooter('columns', updatedColumns);
      return true;
    }
    return false;
  };

  const removeLinkFromColumn = (columnIndex, linkIndex) => {
    const updatedColumns = [...footer.columns];
    updatedColumns[columnIndex].links = updatedColumns[columnIndex].links.filter((_, index) => index !== linkIndex);
    updateFooter('columns', updatedColumns);
  };

  const LinkEditor = ({ columnIndex, column }) => {
    const [newLink, setNewLink] = useState({ label: '', href: '', target: '_self' });
    const [error, setError] = useState('');

    const handleAddLink = () => {
      if (!newLink.label.trim()) {
        setError('Link label is required');
        return;
      }
      if (!newLink.href.trim()) {
        setError('Link URL is required');
        return;
      }
      
      if (addLinkToColumn(columnIndex, newLink)) {
        setNewLink({ label: '', href: '', target: '_self' });
        setError('');
      }
    };

    return (
      <div className="space-y-3">
        <h5 className="font-medium text-gray-700">Links</h5>
        
        {/* Existing Links */}
        {column.links.map((link, linkIndex) => (
          <div key={linkIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
            <div className="flex-1">
              <div className="text-sm font-medium">{link.label}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                {link.href}
                {link.target === '_blank' && <ExternalLink className="h-3 w-3" />}
              </div>
            </div>
            <button
              onClick={() => removeLinkFromColumn(columnIndex, linkIndex)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {/* Add New Link */}
        <div className="border-t pt-3">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Link Label"
                value={newLink.label}
                onChange={(e) => {
                  setNewLink({ ...newLink, label: e.target.value });
                  setError('');
                }}
                className="form-input text-sm"
              />
              <input
                type="text"
                placeholder="URL (e.g., /about, https://...)"
                value={newLink.href}
                onChange={(e) => {
                  setNewLink({ ...newLink, href: e.target.value });
                  setError('');
                }}
                className="form-input text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={newLink.target}
                onChange={(e) => setNewLink({ ...newLink, target: e.target.value })}
                className="form-input text-sm"
              >
                <option value="_self">Same Page</option>
                <option value="_blank">New Tab</option>
              </select>
              
              <button
                onClick={handleAddLink}
                className="btn-outline text-sm px-3 py-1"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Link
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const sections = [
    { id: 'columns', name: 'Columns & Links' },
    { id: 'popular', name: 'Popular Courses' },
    { id: 'legal', name: 'Legal & Copyright' },
    { id: 'branding', name: 'Branding' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Footer Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Customize footer content, links, and layout
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-blue-900 font-medium">Footer Management</h4>
            <p className="text-blue-800 text-sm mt-1">
              Changes to footer content will appear site-wide immediately after saving. 
              Contact information is pulled from Settings tab.
            </p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === section.id
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      {/* Columns & Links Section */}
      {activeSection === 'columns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Footer Columns</h3>
            <button onClick={addColumn} className="btn-primary text-sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Column
            </button>
          </div>

          {footer.columns.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No footer columns yet</p>
              <button onClick={addColumn} className="btn-primary">
                Add First Column
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {footer.columns.map((column, columnIndex) => (
                <div key={column.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={column.title}
                        onChange={(e) => updateColumn(columnIndex, 'title', e.target.value)}
                        className="form-input font-medium"
                        placeholder="Column Title"
                      />
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveColumn(columnIndex, 'up')}
                        disabled={columnIndex === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveColumn(columnIndex, 'down')}
                        disabled={columnIndex === footer.columns.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deleteColumn(columnIndex)}
                        className="p-1 text-red-400 hover:text-red-600 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <LinkEditor columnIndex={columnIndex} column={column} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Popular Courses Section */}
      {activeSection === 'popular' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Popular Courses</h3>
          
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Selection Method
              </label>
              <select
                value={footer.popularCourses.source}
                onChange={(e) => updateFooter('popularCourses', { 
                  ...footer.popularCourses, 
                  source: e.target.value 
                })}
                className="form-input"
              >
                <option value="auto">Auto: Top courses by order</option>
                <option value="manual">Manual: Select specific courses</option>
              </select>
            </div>
            
            {footer.popularCourses.source === 'auto' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Courses to Show
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={footer.popularCourses.limit}
                  onChange={(e) => updateFooter('popularCourses', { 
                    ...footer.popularCourses, 
                    limit: parseInt(e.target.value) || 5 
                  })}
                  className="form-input"
                />
              </div>
            )}
            
            {footer.popularCourses.source === 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Courses (Manual)
                </label>
                <div className="text-sm text-gray-500 mb-2">
                  Manual course selection will be implemented with course picker
                </div>
                {/* TODO: Implement course picker */}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal Section */}
      {activeSection === 'legal' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Legal & Copyright</h3>
          
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copyright Text
              </label>
              <input
                type="text"
                value={footer.legal.copyright}
                onChange={(e) => updateFooter('legal', { 
                  ...footer.legal, 
                  copyright: e.target.value 
                })}
                className="form-input"
                placeholder="© 2024 Your Company. All rights reserved."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy Policy URL
                </label>
                <input
                  type="text"
                  value={footer.legal.privacyPolicy}
                  onChange={(e) => updateFooter('legal', { 
                    ...footer.legal, 
                    privacyPolicy: e.target.value 
                  })}
                  className="form-input"
                  placeholder="/privacy-policy"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms of Service URL
                </label>
                <input
                  type="text"
                  value={footer.legal.terms}
                  onChange={(e) => updateFooter('legal', { 
                    ...footer.legal, 
                    terms: e.target.value 
                  })}
                  className="form-input"
                  placeholder="/terms-of-service"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branding Section */}
      {activeSection === 'branding' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Branding</h3>
          
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Tagline
              </label>
              <input
                type="text"
                value={footer.branding.tagline}
                onChange={(e) => updateFooter('branding', { 
                  ...footer.branding, 
                  tagline: e.target.value 
                })}
                className="form-input"
                placeholder="Your company tagline or motto"
              />
              <p className="text-xs text-gray-500 mt-1">
                This tagline appears below your logo in the footer
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterTab;