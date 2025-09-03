import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

const CategoryManager = ({ content, updateContent }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const formRefs = useRef({});

  // ---------------- Keyboard guard: typing par collapse na ho ----------------
  useEffect(() => {
    const handleKey = (e) => {
      if (!expandedCategory) return;
      const formEl = formRefs.current[expandedCategory];
      if (formEl && e.target instanceof Node && formEl.contains(e.target)) {
        e.stopPropagation();
        if (e.key === 'Escape') e.stopImmediatePropagation();
        return;
      }
      if (e.key === 'Escape') setExpandedCategory(null);
    };

    document.addEventListener('keydown', handleKey, true);
    document.addEventListener('keypress', handleKey, true);
    document.addEventListener('keyup', handleKey, true);
    return () => {
      document.removeEventListener('keydown', handleKey, true);
      document.removeEventListener('keypress', handleKey, true);
      document.removeEventListener('keyup', handleKey, true);
    };
  }, [expandedCategory]);

  const categories = content?.courseCategories || {};
  const courses = content?.courses || [];

  // ---------------- Helpers ----------------
  const generateSlug = (name) =>
    (name || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const sortEntries = Object.entries(categories).sort(([, a], [, b]) => {
    return (a.order || 999) - (b.order || 999);
  });

  // ---------------- Add Category ----------------
  const addCategory = () => {
    const ts = Date.now();
    const maxOrder = Math.max(0, ...Object.values(categories).map((c) => c.order || 0));
    const key = `new-category-${ts}`;
    const newCat = {
      name: 'New Category',
      slug: 'new-category',
      description: 'Enter category description here',
      icon: 'book',
      color: '#3B82F6',
      logo: '',
      visible: true,
      order: maxOrder + 1,
      featured: true,
      seo: { title: '', description: '', keywords: '' },
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    updateContent('courseCategories', { ...categories, [key]: newCat });
    setTimeout(() => setExpandedCategory(key), 100);
  };

  // ---------------- Update Category fields ----------------
  // NOTE: Name change => slug auto-generate (value only). Key same rehta hai jab tak "Sync Key" na click karein.
  const updateCategory = (key, field, value) => {
    const current = categories[key];
    if (!current) return;

    if (field === 'name') {
      const autoSlug = generateSlug(value || '');
      const updated = { ...current, name: value, slug: autoSlug };
      updateContent('courseCategories', { ...categories, [key]: updated });
      return;
    }

    // Slug field readOnly hai; fir bhi kabhi programmatically change karna ho:
    if (field === 'slug') {
      const updated = { ...current, slug: generateSlug(value || '') };
      updateContent('courseCategories', { ...categories, [key]: updated });
      return;
    }

    const updated = { ...current, [field]: value };
    updateContent('courseCategories', { ...categories, [key]: updated });
  };

  // ---------------- Permanent fix: Sync Key (key ≡ slug) ----------------
  const syncSlugKey = (oldKey) => {
    const cat = categories[oldKey];
    if (!cat) return;

    const desired = (cat.slug || '').trim();
    if (!desired) return alert('Slug empty hai. Pehle Name/Slug set karo.');
    if (desired === oldKey) return alert('Slug aur key already same hain.');
    if (categories[desired]) return alert(`"${desired}" key already exists. Slug thoda change karein.`);

    if (
      !confirm(
        `Rename category key?\n\nFrom: ${oldKey}\nTo:   ${desired}\n\nAll course references will be updated.`
      )
    ) {
      return;
    }

    // 1) move category under new key
    const newCategories = { ...categories };
    delete newCategories[oldKey];
    newCategories[desired] = { ...cat, slug: desired };

    // 2) update all courses referencing oldKey
    const updatedCourses = (courses || []).map((course) => ({
      ...course,
      categories: (course.categories || []).map((s) => (s === oldKey ? desired : s)),
    }));

    // 3) save
    updateContent('courseCategories', newCategories);
    updateContent('courses', updatedCourses);

    // keep editor open
    if (expandedCategory === oldKey) setExpandedCategory(desired);

    alert('✅ Key synced to slug. Frontend URL ab slug use karega.');
  };

  // (Optional) One-click: Sync **all** categories keys to slugs (unique handling)
  const syncAllCategories = () => {
    if (!confirm('Sync ALL categories keys to their slugs? This updates all course references.')) return;

    const entries = Object.entries(categories);
    const used = new Set();
    const finalKeyFor = {};

    // compute unique keys
    for (const [oldKey, cat] of entries) {
      const want = generateSlug(cat.slug || cat.name || oldKey) || oldKey;
      let s = want, i = 2;
      while (used.has(s)) s = `${want}-${i++}`;
      used.add(s);
      finalKeyFor[oldKey] = s;
    }

    // rebuild maps
    const newCats = {};
    for (const [oldKey, cat] of entries) {
      const nk = finalKeyFor[oldKey];
      newCats[nk] = { ...cat, slug: nk };
    }

    const newCourses = (courses || []).map((course) => ({
      ...course,
      categories: (course.categories || []).map((k) => finalKeyFor[k] || k),
    }));

    updateContent('courseCategories', newCats);
    updateContent('courses', newCourses);
    alert('✅ All categories synced. URLs now use canonical slugs.');
  };

  // ---------------- Delete Category ----------------
  const deleteCategory = (key) => {
    const categoryName = categories[key]?.name || key;
    const courseCount = getCoursesByCategory(key).length;
    
    const confirmMessage = courseCount > 0 
      ? `Are you sure you want to delete "${categoryName}"?\n\nThis will remove the category from ${courseCount} course(s). The courses will remain but will be unassigned from this category.`
      : `Are you sure you want to delete "${categoryName}"?`;
    
    if (window.confirm(confirmMessage)) {
      // Remove category
      const updatedCategories = { ...categories };
      delete updatedCategories[key];
      
      // Remove category from all courses
      const updatedCourses = courses.map(course => ({
        ...course,
        categories: (course.categories || []).filter(cat => cat !== key)
      }));
      
      updateContent('courseCategories', updatedCategories);
      updateContent('courses', updatedCourses);
      
      // Close expanded panel if this category was expanded
      if (expandedCategory === key) {
        setExpandedCategory(null);
      }
      
      alert(`✅ Category "${categoryName}" deleted successfully!`);
    }
  };

  // ---------------- Course helpers ----------------
  const getCoursesByCategory = (categoryKey) =>
    courses.filter((c) => c.categories && c.categories.includes(categoryKey));

  const assignCourseToCategory = (categoryKey, courseSlug) => {
    const updatedCourses = courses.map((course) => {
      if (course.slug === courseSlug) {
        const cur = course.categories || [];
        if (!cur.includes(categoryKey)) return { ...course, categories: [...cur, categoryKey] };
      }
      return course;
    });
    updateContent('courses', updatedCourses);
  };

  const removeCourseFromCategory = (categoryKey, courseSlug) => {
    const updatedCourses = courses.map((course) => {
      if (course.slug === courseSlug && course.categories) {
        return { ...course, categories: course.categories.filter((c) => c !== categoryKey) };
      }
      return course;
    });
    updateContent('courses', updatedCourses);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <button
          onClick={addCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No categories yet</p>
          <button
            onClick={addCategory}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create First Category
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map(([slug, category]) => (
            <div key={slug} className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {category.logo && (
                    <img src={category.logo} alt={category.name} className="w-8 h-8 object-contain" />
                  )}
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <span className="text-sm text-gray-500">
                    {getCoursesByCategory(slug).length} courses
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${category.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {category.visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCategory(slug, 'visible', !category.visible)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    {category.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setExpandedCategory(expandedCategory === slug ? null : slug);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedCategory(expandedCategory === slug ? null : slug);
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded text-blue-600"
                    title={expandedCategory === slug ? "Collapse category" : "Expand to edit category"}
                  >
                    {expandedCategory === slug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  
                  {/* Separated delete button with confirmation */}
                  <div className="ml-4 border-l pl-4">
                    <button
                      onClick={() => {
                        if (confirm(`⚠️ DELETE CATEGORY: "${category.name}"?\n\nThis will:\n• Delete category permanently\n• Remove from all courses\n• Cannot be undone\n\nType "DELETE" to confirm this is intentional.`)) {
                          const confirmation = prompt('Type "DELETE" to confirm:');
                          if (confirmation === 'DELETE') {
                            deleteCategory(slug);
                          } else {
                            alert('❌ Deletion cancelled - confirmation text did not match');
                          }
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
                      title="Delete category (requires confirmation)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {expandedCategory === slug && (
                <div 
                  ref={(el) => formRefs.current[slug] = el}
                  className="space-y-4 pt-4 border-t bg-blue-50 p-4 rounded-lg"
                  // Prevent only problematic keyboard events from bubbling, allow normal input
                  onKeyDown={(e) => {
                    // Only stop propagation for keys that might trigger unwanted behavior
                    if (e.key === 'Escape' || e.key === 'Enter') {
                      e.stopPropagation();
                      console.log('🚫 Stopped propagation for potentially problematic key:', e.key);
                    }
                    // Let all other keys (typing, paste, etc.) bubble normally
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent any click handlers from collapsing
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation(); // Prevent mousedown from triggering collapse
                  }}
                  style={{ isolation: 'isolate' }}
                >
                  <div className="bg-green-100 border border-green-300 rounded p-2 mb-4">
                    <p className="text-green-800 text-sm font-medium">
                      🔓 <strong>Fixed Form</strong>: This form uses enhanced focus detection for Firefox compatibility. 
                      You can now type, paste, and edit freely. Panel will only close with the collapse button or Escape key when not focused in any input.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={category.name || ''}
                        onChange={(e) => updateCategory(slug, 'name', e.target.value)}
                        onFocus={(e) => {
                          e.target.setAttribute('data-focused', 'true');
                          console.log('🎯 Name field focused');
                        }}
                        onBlur={(e) => {
                          e.target.removeAttribute('data-focused');
                          console.log('👋 Name field blurred');
                        }}
                        className="w-full border rounded p-2"
                        placeholder="Enter category name"
                        autoFocus={slug.includes('new-category')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Slug</label>
                      <input
                        type="text"
                        value={category.slug}
                        onChange={(e) => updateCategory(slug, 'slug', e.target.value)}
                        onFocus={(e) => {
                          e.target.setAttribute('data-focused', 'true');
                          console.log('🎯 Slug field focused');
                        }}
                        onBlur={(e) => {
                          e.target.removeAttribute('data-focused');
                          console.log('👋 Slug field blurred');
                        }}
                        className="w-full border rounded p-2"
                        placeholder="category-url-slug"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Order</label>
                      <input
                        type="number"
                        value={category.order || 1}
                        onChange={(e) => updateCategory(slug, 'order', parseInt(e.target.value))}
                        onFocus={(e) => e.target.setAttribute('data-focused', 'true')}
                        onBlur={(e) => e.target.removeAttribute('data-focused')}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <input
                        type="color"
                        value={category.color || '#3B82F6'}
                        onChange={(e) => updateCategory(slug, 'color', e.target.value)}
                        onFocus={(e) => e.target.setAttribute('data-focused', 'true')}
                        onBlur={(e) => e.target.removeAttribute('data-focused')}
                        className="w-full border rounded p-2 h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Logo URL</label>
                    <input
                      type="url"
                      value={category.logo || ''}
                      onChange={(e) => updateCategory(slug, 'logo', e.target.value)}
                      onFocus={(e) => e.target.setAttribute('data-focused', 'true')}
                      onBlur={(e) => e.target.removeAttribute('data-focused')}
                      className="w-full border rounded p-2"
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">Company logo for display in dropdowns and cards</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={category.description}
                      onChange={(e) => updateCategory(slug, 'description', e.target.value)}
                      onFocus={(e) => {
                        e.target.setAttribute('data-focused', 'true');
                        console.log('🎯 Description field focused');
                      }}
                      onBlur={(e) => {
                        e.target.removeAttribute('data-focused');
                        console.log('👋 Description field blurred');
                      }}
                      className="w-full border rounded p-2"
                      rows="2"
                      placeholder="Enter category description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Assigned Courses ({getCoursesByCategory(slug).length})
                    </label>
                    <div className="space-y-2">
                      {getCoursesByCategory(slug).map(course => (
                        <div key={course.slug} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <span className="font-medium">{course.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Only stop this specific event
                              removeCourseFromCategory(slug, course.slug);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      <select
                        onChange={(e) => {
                          e.stopPropagation(); // Only stop this specific event
                          if (e.target.value) {
                            assignCourseToCategory(slug, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full border rounded p-2"
                      >
                        <option value="">Add a course...</option>
                        {courses
                          .filter(course => !getCoursesByCategory(slug).some(c => c.slug === course.slug))
                          .map(course => (
                            <option key={course.slug} value={course.slug}>
                              {course.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Save reminder */}
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mt-4">
                    <p className="text-yellow-800 text-sm">
                      💡 <strong>Remember:</strong> Click "Save Changes" at the top to save your category edits to the database.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;