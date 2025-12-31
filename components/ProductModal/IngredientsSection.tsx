import { useEffect } from 'react';
import styles from '../ProductModal.module.css';

interface CustomIngredient {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  ingredient_category?: 'boosters' | 'fruits' | 'toppings';
  selection_type?: 'single' | 'multiple';
  price_override?: number;
}

interface IngredientsSectionProps {
  ingredients: CustomIngredient[];
  selectedIngredients: Set<number>;
  onIngredientToggle: (ingredientId: number, selectionType: 'single' | 'multiple', category?: string) => void;
}

export default function IngredientsSection({
  ingredients,
  selectedIngredients,
  onIngredientToggle,
}: IngredientsSectionProps) {
  // Debug logging
  useEffect(() => {
    console.log('IngredientsSection rendered with ingredients:', ingredients.length);
  }, [ingredients]);

  if (ingredients.length === 0) {
    return null;
  }

  // Group ingredients by category
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    const category = ingredient.ingredient_category || 'fruits';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(ingredient);
    return acc;
  }, {} as Record<string, typeof ingredients>);

  const categoryLabels: Record<string, string> = {
    fruits: 'Fruits',
    boosters: 'Boosters',
    toppings: 'Toppings'
  };

  return (
    <div className={styles['modal-section']}>
      <h3 className={styles['section-title']}>Add Ingredients</h3>
      <p style={{ fontSize: '14px', color: '#70758c', marginBottom: '16px' }}>
        Choose additional ingredients to customize your juice
      </p>
      {Object.entries(groupedIngredients).map(([category, categoryIngredients]) => {
        const selectionType = categoryIngredients[0]?.selection_type || 'multiple';
        const isSingleSelection = selectionType === 'single';
        
        return (
          <div key={category} className={styles['ingredient-category']}>
            <h4 className={styles['category-title']}>
              {categoryLabels[category] || category}
              {isSingleSelection && <span className={styles['selection-hint']}> (Choose one)</span>}
            </h4>
            <div className={styles['ingredients-list']}>
              {categoryIngredients.map(ingredient => {
                const isSelected = selectedIngredients.has(ingredient.id);
                const price = ingredient.price_override !== undefined && ingredient.price_override !== null
                  ? ingredient.price_override
                  : ingredient.price;
                return (
                  <label 
                    key={ingredient.id} 
                    className={`${styles['ingredient-item']} ${isSelected ? styles['ingredient-item-selected'] || '' : ''}`}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <input
                      type={isSingleSelection ? 'radio' : 'checkbox'}
                      name={isSingleSelection ? `ingredient-${category}` : undefined}
                      checked={isSelected}
                      onChange={(e) => {
                        console.log('Ingredient input changed:', ingredient.name, ingredient.id, 'was:', isSelected, 'will be:', !isSelected);
                        onIngredientToggle(ingredient.id, selectionType, category);
                      }}
                      onClick={(e) => {
                        // Prevent double-firing
                        e.stopPropagation();
                      }}
                      className={styles['ingredient-checkbox']}
                    />
                    <div className={styles['ingredient-info']} onClick={(e) => {
                      // Also allow clicking on the text to toggle
                      e.preventDefault();
                      console.log('Ingredient info clicked:', ingredient.name, ingredient.id);
                      onIngredientToggle(ingredient.id, selectionType, category);
                    }}>
                      <span className={styles['ingredient-name']}>{ingredient.name}</span>
                      {price > 0 && (
                        <span className={styles['ingredient-price']}>+₪{price.toFixed(0)}</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

