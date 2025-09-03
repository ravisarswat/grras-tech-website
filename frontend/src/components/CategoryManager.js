import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

const CategoryManager = ({ content, updateContent, saveContent, saving }) => {
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
    if (!cat) {
      console.log('❌ Category not found:', oldKey);
      return;
    }

    const desired = (cat.slug || '').trim();
    console.log('🔄 Sync Key attempt:', { oldKey, currentSlug: cat.slug, desired });
    
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

    console.log('✅ User confirmed key sync');

    // 1) move category under new key
    const newCategories = { ...categories };
    delete newCategories[oldKey];
    newCategories[desired] = { ...cat, slug: desired };

    // 2) update all courses referencing oldKey
    const updatedCourses = (courses || []).map((course) => ({
      ...course,
      categories: (course.categories || []).map((s) => (s === oldKey ? desired : s)),
    }));

    console.log('📝 Syncing key:', { 
      oldKey, 
      newKey: desired, 
      updatedCategories: Object.keys(newCategories),
      coursesUpdated: updatedCourses.length 
    });

    // 3) save
    updateContent('courseCategories', newCategories);
    updateContent('courses', updatedCourses);

    // keep editor open
    if (expandedCategory === oldKey) setExpandedCategory(desired);

    alert('✅ Key synced to slug. Frontend URL ab slug use karega. Don\'t forget to click "Save Changes" at the top.');
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
    
    console.log('🗑️ Deleting category:', key, categoryName);
    
    const confirmMessage = courseCount > 0 
      ? `Are you sure you want to delete "${categoryName}"?\n\nThis will remove the category from ${courseCount} course(s). The courses will remain but will be unassigned from this category.`
      : `Are you sure you want to delete "${categoryName}"?`;
    
    if (window.confirm(confirmMessage)) {
      console.log('✅ User confirmed deletion');
      
      // Remove category
      const updatedCategories = { ...categories };
      delete updatedCategories[key];
      
      // Remove category from all courses
      const updatedCourses = courses.map(course => ({
        ...course,
        categories: (course.categories || []).filter(cat => cat !== key)
      }));
      
      console.log('📝 Updating content:', Object.keys(updatedCategories));
      console.log('📝 Updated courses count:', updatedCourses.length);
      
      // Force state update by creating completely new objects
      updateContent('courseCategories', updatedCategories);
      updateContent('courses', updatedCourses);
      
      // Close expanded panel if this category was expanded
      if (expandedCategory === key) {
        setExpandedCategory(null);
      }
      
      console.log('✅ Category deleted, state updated');
      alert(`✅ Category "${categoryName}" deleted successfully! Click "Save Changes" to persist changes.`);
    } else {
      console.log('❌ User cancelled deletion');
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

  // ---------------- UI ----------------
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <div className="flex gap-2">
          <button
            onClick={syncAllCategories}
            className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
            title="Rename all category keys to their slugs and update all course references"
          >
            Sync All Keys
          </button>
          <button
            onClick={addCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {sortEntries.length === 0 ? (
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
          {sortEntries.map(([key, category]) => (
            <div key={key} className="bg-white border rounded-lg p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {category.logo && (
                    <img src={category.logo} alt={category.name} className="w-8 h-8 object-contain" />
                  )}
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <span className="text-sm text-gray-500">
                    {getCoursesByCategory(key).length} courses
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      category.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {category.visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCategory(key, 'visible', !category.visible)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title={category.visible ? 'Hide' : 'Show'}
                  >
                    {category.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setExpandedCategory(expandedCategory === key ? null : key);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedCategory(expandedCategory === key ? null : key);
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded text-blue-600"
                    title={expandedCategory === key ? 'Collapse category' : 'Expand to edit category'}
                  >
                    {expandedCategory === key ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {/* Delete Button */}
                  <div className="ml-4 border-l pl-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteCategory(key);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded form */}
              {expandedCategory === key && (
                <div
                  ref={(el) => (formRefs.current[key] = el)}
                  className="space-y-4 pt-4 border-t bg-blue-50 p-4 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{ isolation: 'isolate' }}
                >
                  <div className="bg-green-100 border border-green-300 rounded p-2 mb-4">
                    <p className="text-green-800 text-sm font-medium">
                      🔓 Form Ready: You can now type, paste, and edit freely. Panel will only close
                      with collapse button or Escape key when not focused.
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={category.name || ''}
                        onChange={(e) => updateCategory(key, 'name', e.target.value)}
                        className="w-full border rounded p-2"
                        placeholder="Enter category name"
                        autoFocus={String(key).includes('new-category')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Slug <span className="text-xs text-gray-500">(auto-generated)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={category.slug || ''}
                          readOnly
                          className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed"
                          placeholder="auto-generated-from-name"
                          title="Slug is auto-generated from Name"
                        />
                        <button
                          type="button"
                          className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            syncSlugKey(key);
                          }}
                          title="Rename the category key to match this slug (updates all course references)"
                        >
                          Sync Key
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Click "Sync Key" to make the URL/tab use this slug.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Order</label>
                      <input
                        type="number"
                        value={category.order || 1}
                        onChange={(e) => updateCategory(key, 'order', parseInt(e.target.value))}
                        className="w-full border rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <input
                        type="color"
                        value={category.color || '#3B82F6'}
                        onChange={(e) => updateCategory(key, 'color', e.target.value)}
                        className="w-full border rounded p-2 h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Logo URL</label>
                    <input
                      type="url"
                      value={category.logo || ''}
                      onChange={(e) => updateCategory(key, 'logo', e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">Company logo for display in dropdowns and cards</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={category.description || ''}
                      onChange={(e) => updateCategory(key, 'description', e.target.value)}
                      className="w-full border rounded p-2"
                      rows={2}
                      placeholder="Enter category description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Assigned Courses ({getCoursesByCategory(key).length})
                    </label>
                    <div className="space-y-2">
                      {getCoursesByCategory(key).map((course) => (
                        <div key={course.slug} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <span className="font-medium">{course.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCourseFromCategory(key, course.slug);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      <select
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.value) {
                            assignCourseToCategory(key, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full border rounded p-2"
                      >
                        <option value="">Add a course...</option>
                        {courses
                          .filter((c) => !getCoursesByCategory(key).some((x) => x.slug === c.slug))
                          .map((course) => (
                            <option key={course.slug} value={course.slug}>
                              {course.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mt-4">
                    <p className="text-yellow-800 text-sm">
                      💡 <strong>Remember:</strong> Click "Save Changes" at the top to save your
                      category edits to the database.
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