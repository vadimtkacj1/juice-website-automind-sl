'use client';

import { useEffect } from 'react';
import { Cherry, Sparkles, Cookie } from 'lucide-react';
import styles from '../ProductModal.module.css';
import { translateToHebrew } from '@/lib/translations';

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
    fruits: translateToHebrew('Fruits'),
    boosters: translateToHebrew('Boosters'),
    toppings: translateToHebrew('Toppings')
  };

  return (
    <div className={styles['modal-section']}>
      <h3 className={styles['section-title']}>
        {translateToHebrew('Customize Your Order')}
      </h3>
      <p style={{ 
        fontSize: '14px', 
        color: '#70758c', 
        marginBottom: '20px',
        fontWeight: 500
      }}>
        {translateToHebrew('Add your favorite ingredients')}
      </p>
      
      {Object.entries(groupedIngredients).map(([category, categoryIngredients]) => {
        const selectionType = categoryIngredients[0]?.selection_type || 'multiple';
        const isSingleSelection = selectionType === 'single';
        const IconComponent = categoryIcons[category] || Sparkles;
        
        return (
          <div key={category} className={styles['ingredient-category']}>
            <h4 className={styles['category-title']}>
              <IconComponent size={16} style={{ color: '#7322ff' }} />
              {categoryLabels[category] || translateToHebrew(category)}
              {isSingleSelection && (
                <span className={styles['selection-hint']}>
                  {translateToHebrew('Choose one')}
                </span>
              )}
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
                    className={`${styles['ingredient-item']} ${isSelected ? styles['ingredient-item-selected'] : ''}`}
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
                        e.stopPropagation();
                      }}
                      className={styles['ingredient-checkbox']}
                    />
                    <div 
                      className={styles['ingredient-info']} 
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Ingredient info clicked:', ingredient.name, ingredient.id);
                        onIngredientToggle(ingredient.id, selectionType, category);
                      }}
                    >
                      <span className={styles['ingredient-name']}>
                        {translateToHebrew(ingredient.name)}
                      </span>
                      {price > 0 && (
                        <span className={styles['ingredient-price']}>
                          +₪{price.toFixed(0)}
                        </span>
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
