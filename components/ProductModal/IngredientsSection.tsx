'use client';

import { Cherry, Sparkles, Cookie, Check } from 'lucide-react';
import styles from '../ProductModal.module.css';
import { translateToHebrew } from '@/lib/translations';
import OptimizedImage from '@/components/OptimizedImage';

interface CustomIngredient {
  id: number;
  name: string;
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

const categoryIcons: Record<string, React.ElementType> = {
  fruits: Cherry,
  boosters: Sparkles,
  toppings: Cookie,
};

export default function IngredientsSection({
  ingredients,
  selectedIngredients,
  onIngredientToggle,
}: IngredientsSectionProps) {
  
  if (ingredients.length === 0) return null;

  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    const category = ingredient.ingredient_category || 'fruits';
    if (!acc[category]) acc[category] = [];
    acc[category].push(ingredient);
    return acc;
  }, {} as Record<string, typeof ingredients>);

  const categoryLabels: Record<string, string> = {
    fruits: translateToHebrew('Fruits'),
    boosters: translateToHebrew('Boosters'),
    toppings: translateToHebrew('Toppings')
  };

  return (
    <div className={styles['ingredients-section-container']}>
      <h3 className={styles['section-title']}>{translateToHebrew('Add Ingredients')}</h3>
      <p className={styles['section-description']}>
        {translateToHebrew('Choose additional ingredients to customize your juice')}
      </p>
      
      {Object.entries(groupedIngredients).map(([category, categoryIngredients]) => {
        const selectionType = categoryIngredients[0]?.selection_type || 'multiple';
        const isSingleSelection = selectionType === 'single';
        const IconComponent = categoryIcons[category] || Sparkles;
        
        return (
          <div key={category} className={styles['category-group']}>
            <h4 className={styles['category-header']}>
              <IconComponent size={18} />
              <span>{categoryLabels[category] || translateToHebrew(category)}</span>
              {isSingleSelection && <small className={styles['hint-text']}>({translateToHebrew('Choose one')})</small>}
            </h4>

            <div className={styles['ingredients-grid']}>
              {categoryIngredients.map(ingredient => {
                const isSelected = selectedIngredients.has(ingredient.id);
                const price = ingredient.price_override ?? ingredient.price;
                
                return (
                  <label 
                    key={ingredient.id} 
                    className={`${styles['ingredient-card']} ${isSelected ? styles['is-selected'] : ''}`}
                  >
                    <input
                      type={isSingleSelection ? 'radio' : 'checkbox'}
                      name={isSingleSelection ? `ing-${category}` : undefined}
                      checked={isSelected}
                      onChange={() => onIngredientToggle(ingredient.id, selectionType, category)}
                      className={styles['real-input']}
                    />
                    
                    {/* Визуальный индикатор выбора */}
                    <div className={styles['card-selector']}>
                      {isSelected && <Check size={12} strokeWidth={4} />}
                    </div>

                    <div className={styles['card-image-wrapper']}>
                      {ingredient.image ? (
                        <OptimizedImage
                          src={ingredient.image}
                          alt={ingredient.name}
                          width={80}
                          height={80}
                          className={styles['card-img']}
                        />
                      ) : (
                        <span className={styles['card-emoji']}>🍎</span>
                      )}
                    </div>

                    <div className={styles['card-content']}>
                      <span className={styles['card-name']}>{translateToHebrew(ingredient.name)}</span>
                      {price > 0 && <span className={styles['card-price']}>+₪{Number(price).toFixed(0)}</span>}
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