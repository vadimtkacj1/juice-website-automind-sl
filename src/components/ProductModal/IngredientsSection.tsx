'use client';

import { Check, AlertCircle } from 'lucide-react';
import styles from './ProductModal.module.css';
import { translateToHebrew } from '@/lib/translations';
import OptimizedImage from './components/OptimizedImage/OptimizedImage';

interface CustomIngredient {
  id: number;
  name: string;
  price: number;
  image?: string;
  ingredient_category?: 'boosters' | 'fruits' | 'toppings';
  selection_type?: 'single' | 'multiple';
  price_override?: number;
  ingredient_group?: string;
  is_required?: boolean;
}

interface IngredientsSectionProps {
  ingredients: CustomIngredient[];
  selectedIngredients: Set<number>;
  onIngredientToggle: (ingredientId: number, selectionType: 'single' | 'multiple', category?: string, groupKey?: string) => void;
}

export default function IngredientsSection({
  ingredients,
  selectedIngredients,
  onIngredientToggle,
}: IngredientsSectionProps) {
  
  if (ingredients.length === 0) return null;

  // Group ingredients by group name
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    const groupKey = ingredient.ingredient_group?.trim() || '__ungrouped';
    if (!acc[groupKey]) {
      acc[groupKey] = {
        ingredients: [],
        isRequired: false,
        selectionType: 'multiple' as 'single' | 'multiple',
        groupName: groupKey !== '__ungrouped' ? ingredient.ingredient_group! : null,
      };
    }
    acc[groupKey].ingredients.push(ingredient);
    if (ingredient.is_required) {
      acc[groupKey].isRequired = true;
    }
    if (ingredient.selection_type === 'single') {
      acc[groupKey].selectionType = 'single';
    }
    return acc;
  }, {} as Record<string, {
    ingredients: typeof ingredients;
    isRequired: boolean;
    selectionType: 'single' | 'multiple';
    groupName: string | null;
  }>);

  return (
    <div className={styles['ingredients-section-container']}>
      <h3 className={styles['section-title']}>{translateToHebrew('Add Ingredients')}</h3>
      
      {Object.entries(groupedIngredients).map(([groupKey, group]) => {
        const isSingleSelection = group.selectionType === 'single';
        const normalizedGroupKey = groupKey.replace(/\s+/g, '-');
        const radioName = isSingleSelection ? `ing-group-${normalizedGroupKey}` : undefined;
        const hasSelectedFromGroup = group.ingredients.some(ing => selectedIngredients.has(ing.id));
        const groupDisplayName = group.groupName ? translateToHebrew(group.groupName) : null;
        
        return (
          <div 
            key={groupKey} 
            className={`${styles['ingredient-group-container']} ${group.isRequired && !hasSelectedFromGroup ? styles['group-required'] : ''}`}
          >
            {groupDisplayName && (
              <div className={styles['group-label']}>
                <span className={styles['group-name']}>{groupDisplayName}</span>
                <span className={styles['group-count']}>
                  {group.ingredients.length}
                </span>
                {isSingleSelection && (
                  <span className={styles['group-hint']}>({translateToHebrew('Choose one')})</span>
                )}
                {group.isRequired && (
                  <span className={styles['required-badge']}>
                    <AlertCircle size={14} />
                    {translateToHebrew('Required')}
                  </span>
                )}
              </div>
            )}

            <div className={styles['ingredients-grid']}>
              {group.ingredients.map(ingredient => {
                const isSelected = selectedIngredients.has(ingredient.id);
                const price = ingredient.price_override ?? ingredient.price;
                
                return (
                  <label 
                    key={ingredient.id} 
                    className={`${styles['ingredient-card']} ${isSelected ? styles['is-selected'] : ''} ${group.isRequired && !hasSelectedFromGroup ? styles['card-required'] : ''}`}
                  >
                    <input
                      type={isSingleSelection ? 'radio' : 'checkbox'}
                      name={radioName}
                      checked={isSelected}
                      onChange={() => onIngredientToggle(
                        ingredient.id, 
                        group.selectionType, 
                        ingredient.ingredient_category,
                        group.groupName || undefined
                      )}
                      className={styles['hidden-input']}
                    />
                    
                    {isSelected && (
                      <div className={styles['selection-badge']}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}

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