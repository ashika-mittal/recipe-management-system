import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { submitRecipe, getDishes, addDish } from '../firebase/firestore';
import { SUB_CATEGORIES, CUISINE_TYPES, DIFFICULTY_LEVELS } from '../utils/constants';
import { slugify } from '../utils/helpers';
import { FiPlus, FiTrash2, FiLink, FiCheck, FiAlertCircle, FiImage } from 'react-icons/fi';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';

export default function SubmitRecipePage() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isNewDish, setIsNewDish] = useState(false);

  const [form, setForm] = useState({
    dishId: '',
    newDishName: '',
    title: '',
    category: 'veg',
    subCategory: '',
    cuisine: '',
    description: '',
    difficulty: 'medium',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [''],
    instructions: [''],
    tips: '',
    imageUrl: '',
  });

  useEffect(() => {
    async function loadDishes() {
      try {
        const veg = await getDishes({ category: 'veg' });
        const nonveg = await getDishes({ category: 'non-veg' });
        setDishes([...veg, ...nonveg]);
      } catch (err) { console.error(err); }
    }
    loadDishes();
  }, []);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleListChange = (field, idx, value) => {
    const arr = [...form[field]];
    arr[idx] = value;
    setForm({ ...form, [field]: arr });
  };

  const addListItem = (field) => {
    setForm({ ...form, [field]: [...form[field], ''] });
  };

  const removeListItem = (field, idx) => {
    if (form[field].length <= 1) return;
    const arr = form[field].filter((_, i) => i !== idx);
    setForm({ ...form, [field]: arr });
  };

  const validate = () => {
    if (!isNewDish && !form.dishId) return 'Select a dish or create a new one.';
    if (isNewDish && !form.newDishName.trim()) return 'Enter the new dish name.';
    if (!form.title.trim()) return 'Enter a recipe title.';
    if (!form.subCategory) return 'Select a sub-category.';
    if (!form.cuisine) return 'Select a cuisine.';
    if (!form.description.trim()) return 'Enter a description.';
    if (!form.prepTime || !form.cookTime) return 'Enter prep and cook times.';
    if (!form.servings) return 'Enter number of servings.';
    if (form.ingredients.filter(Boolean).length < 2) return 'Add at least 2 ingredients.';
    if (form.instructions.filter(Boolean).length < 2) return 'Add at least 2 steps.';
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    setLoading(true);
    setError('');

    try {
      let dishId = form.dishId;

      if (isNewDish) {
        dishId = await addDish({
          name: form.newDishName.trim(),
          slug: slugify(form.newDishName.trim()),
          category: form.category,
          subCategory: form.subCategory,
          cuisine: form.cuisine,
          description: form.description.trim(),
          imageUrl: form.imageUrl.trim() || PLACEHOLDER_IMAGE,
          status: 'approved',
        });
      }

      const imageUrl = form.imageUrl.trim() || PLACEHOLDER_IMAGE;
      const dishName = isNewDish ? form.newDishName.trim() : dishes.find((d) => d.id === dishId)?.name || '';

      await submitRecipe({
        dishId,
        dishName,
        title: form.title.trim(),
        category: form.category,
        subCategory: form.subCategory,
        cuisine: form.cuisine,
        description: form.description.trim(),
        difficulty: form.difficulty,
        prepTime: parseInt(form.prepTime),
        cookTime: parseInt(form.cookTime),
        totalTime: parseInt(form.prepTime) + parseInt(form.cookTime),
        servings: parseInt(form.servings),
        ingredients: form.ingredients.filter(Boolean),
        instructions: form.instructions.filter(Boolean),
        tips: form.tips.trim(),
        imageUrl,
        authorId: currentUser.uid,
        authorName: userData?.displayName || 'Anonymous',
      });

      setSuccess(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-3xl text-success" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-text mb-2">Recipe Submitted!</h2>
          <p className="text-text-secondary text-sm">Your recipe is pending admin review. Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-heading text-text mb-2">Submit a Recipe</h1>
      <p className="text-text-secondary mb-8">Share your culinary creation with the community.</p>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-light text-danger text-sm mb-6">
          <FiAlertCircle className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Dish selection */}
        <fieldset className="bg-white border border-border rounded-xl p-5 space-y-4">
          <legend className="text-sm font-bold text-text px-1">Dish</legend>
          <div className="flex gap-4">
            <button type="button" onClick={() => setIsNewDish(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${!isNewDish ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'}`}>
              Existing Dish
            </button>
            <button type="button" onClick={() => setIsNewDish(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isNewDish ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary'}`}>
              Propose New Dish
            </button>
          </div>
          {isNewDish ? (
            <input name="newDishName" value={form.newDishName} onChange={onChange} placeholder="e.g. Paneer Bhurji"
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus-ring" />
          ) : (
            <select name="dishId" value={form.dishId} onChange={onChange}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-white focus-ring">
              <option value="">Select a dish…</option>
              {dishes.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.category})</option>)}
            </select>
          )}
        </fieldset>

        {/* Basic info */}
        <fieldset className="bg-white border border-border rounded-xl p-5 space-y-4">
          <legend className="text-sm font-bold text-text px-1">Recipe Details</legend>
          <Input label="Recipe Title" name="title" value={form.title} onChange={onChange} placeholder="e.g. Grandma's Classic Paneer Butter Masala" />
          <Input label="Description" name="description" value={form.description} onChange={onChange} placeholder="Briefly describe your recipe…" multiline />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Select label="Category" name="category" value={form.category} onChange={onChange}
              options={[{ value: 'veg', label: 'Vegetarian' }, { value: 'non-veg', label: 'Non-Vegetarian' }]} />
            <Select label="Type" name="subCategory" value={form.subCategory} onChange={onChange} options={SUB_CATEGORIES} placeholder="Select…" />
            <Select label="Cuisine" name="cuisine" value={form.cuisine} onChange={onChange} options={CUISINE_TYPES} placeholder="Select…" />
            <Select label="Difficulty" name="difficulty" value={form.difficulty} onChange={onChange} options={DIFFICULTY_LEVELS} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Prep Time (min)" name="prepTime" value={form.prepTime} onChange={onChange} type="number" placeholder="15" />
            <Input label="Cook Time (min)" name="cookTime" value={form.cookTime} onChange={onChange} type="number" placeholder="30" />
            <Input label="Servings" name="servings" value={form.servings} onChange={onChange} type="number" placeholder="4" />
          </div>
        </fieldset>

        {/* Ingredients */}
        <fieldset className="bg-white border border-border rounded-xl p-5">
          <legend className="text-sm font-bold text-text px-1">Ingredients</legend>
          <div className="space-y-2 mt-2">
            {form.ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input value={ing} onChange={(e) => handleListChange('ingredients', i, e.target.value)}
                  placeholder={`Ingredient ${i + 1}`} className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus-ring" />
                {form.ingredients.length > 1 && (
                  <button type="button" onClick={() => removeListItem('ingredients', i)} className="text-text-muted hover:text-danger transition-colors px-2"><FiTrash2 /></button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addListItem('ingredients')}
            className="mt-3 flex items-center gap-1 text-sm text-primary font-medium hover:underline"><FiPlus /> Add ingredient</button>
        </fieldset>

        {/* Instructions */}
        <fieldset className="bg-white border border-border rounded-xl p-5">
          <legend className="text-sm font-bold text-text px-1">Instructions</legend>
          <div className="space-y-2 mt-2">
            {form.instructions.map((step, i) => (
              <div key={i} className="flex gap-2">
                <span className="w-7 h-7 rounded-full bg-page text-xs font-bold text-text-muted flex items-center justify-center shrink-0 mt-1.5">{i + 1}</span>
                <textarea value={step} onChange={(e) => handleListChange('instructions', i, e.target.value)}
                  placeholder={`Step ${i + 1}`} rows={2} className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus-ring resize-none" />
                {form.instructions.length > 1 && (
                  <button type="button" onClick={() => removeListItem('instructions', i)} className="text-text-muted hover:text-danger transition-colors px-2 self-start mt-2"><FiTrash2 /></button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addListItem('instructions')}
            className="mt-3 flex items-center gap-1 text-sm text-primary font-medium hover:underline"><FiPlus /> Add step</button>
        </fieldset>

        {/* Tips */}
        <fieldset className="bg-white border border-border rounded-xl p-5">
          <legend className="text-sm font-bold text-text px-1">Chef's Tips (optional)</legend>
          <textarea name="tips" value={form.tips} onChange={onChange} rows={2} placeholder="Any tips or tricks?"
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus-ring resize-none mt-2" />
        </fieldset>

        {/* Image URL */}
        <fieldset className="bg-white border border-border rounded-xl p-5">
          <legend className="text-sm font-bold text-text px-1">Recipe Image (optional)</legend>
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-3">
              <FiLink className="text-text-muted" />
              <input name="imageUrl" value={form.imageUrl} onChange={onChange}
                placeholder="Paste an image URL (e.g. from Unsplash or Google Images)"
                className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm focus-ring" />
            </div>
            {form.imageUrl.trim() ? (
              <div className="rounded-xl overflow-hidden border border-border bg-border-light">
                <img src={form.imageUrl.trim()} alt="Preview"
                  className="w-full max-h-48 object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 text-center">
                <FiImage className="text-2xl text-text-muted mb-2" />
                <span className="text-sm text-text-muted">Paste an image URL above, or leave blank for a default image</span>
              </div>
            )}
          </div>
        </fieldset>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
          {loading ? 'Submitting…' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
}

/* ── Form helpers ── */
function Input({ label, multiline, ...props }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      <Tag {...props} rows={multiline ? 3 : undefined}
        className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus-ring resize-none" />
    </div>
  );
}

function Select({ label, options, placeholder, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      <select {...props} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white focus-ring">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
