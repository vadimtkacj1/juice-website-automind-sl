'use client';

import { memo, useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';
import OptimizedImage from './components/OptimizedImage/OptimizedImage';
import { cn } from '@/lib/utils';

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
  onIngredientToggle: (
    ingredientId: number,
    selectionType: 'single' | 'multiple',
    category?: string,
    groupKey?: string
  ) => void;
  missingRequiredGroups?: string[];
  shouldHighlightMissing?: boolean;
}

export default function IngredientsSection({
  ingredients,
  selectedIngredients,
  onIngredientToggle,
  missingRequiredGroups = [],
  shouldHighlightMissing = false,
}: IngredientsSectionProps) {
  const [highlightedGroup, setHighlightedGroup] = useState<string | null>(null);
  
  // Debug logging for mobile
  if (typeof window !== 'undefined') {
    console.log('[IngredientsSection] Ingredients count:', ingredients.length);
    console.log('[IngredientsSection] Screen width:', window.innerWidth);
  }

  if (ingredients.length === 0) return null;

  /**
   * Separate ingredients into two main categories: 
   * 1. Grouped (structured sets)
   * 2. Ungrouped (individual/custom add-ons)
   */
  const { grouped, ungrouped } = ingredients.reduce((acc, ingredient) => {
    const groupKey = ingredient.ingredient_group?.trim();
    
    if (groupKey) {
      if (!acc.grouped[groupKey]) {
        acc.grouped[groupKey] = {
          ingredients: [],
          isRequired: false,
          selectionType: 'single', // Groups usually imply single selection (e.g. "Choose Base")
          groupName: ingredient.ingredient_group!,
        };
      }
      acc.grouped[groupKey].ingredients.push(ingredient);
      if (ingredient.is_required) acc.grouped[groupKey].isRequired = true;
    } else {
      acc.ungrouped.push(ingredient);
    }
    
    return acc;
  }, { 
    grouped: {} as Record<string, { ingredients: CustomIngredient[], isRequired: boolean, selectionType: 'single' | 'multiple', groupName: string }>, 
    ungrouped: [] as CustomIngredient[] 
  });

  return (
    <div className="mt-6 sm:mt-10 space-y-8 sm:space-y-12" dir="rtl">
      {/* 1. Main Header - Cleaned up (no purple line, Hebrew only) */}
      <div className="mb-6 sm:mb-8 text-center sm:text-right">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {'הוסף מרכיבים'}
        </h3>
      </div>
      
      {/* 2. Structured Groups Section (e.g., Base selection, Size, etc.) */}
      {Object.entries(grouped).map(([groupKey, group]) => {
        const isMissing = missingRequiredGroups.includes(group.groupName);
        const shouldPulse = isMissing && shouldHighlightMissing;

        return (
        <div
          key={groupKey}
          className={cn(
            "animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-2xl transition-all",
            shouldPulse && "ring-4 ring-red-300 ring-opacity-60 p-4 bg-red-50/30 animate-pulse"
          )}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4 px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className={cn(
                "text-lg sm:text-xl font-extrabold",
                isMissing ? "text-red-600" : "text-slate-800"
              )}>
                {translateToHebrew(group.groupName)}
              </span>
              {group.isRequired && (
                <span className={cn(
                  "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-bold rounded-full border",
                  isMissing
                    ? "bg-red-100 text-red-700 border-red-300"
                    : "bg-red-50 text-red-600 border-red-100"
                )}>
                  <AlertCircle size={12} className="sm:w-[14px] sm:h-[14px]" />
                  חובה
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase">
              בחר אחד
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {group.ingredients.map(ingredient => (
              <IngredientRow
                key={ingredient.id}
                ingredient={ingredient}
                isSelected={selectedIngredients.has(ingredient.id)}
                isSingle={true}
                onToggle={() => onIngredientToggle(
                  ingredient.id,
                  'single',
                  ingredient.ingredient_category,
                  group.groupName
                )}
              />
            ))}
          </div>
        </div>
        );
      })}

      {/* 3. Custom Ingredients / Extras Section (Ungrouped items) */}
      {ungrouped.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4 px-1 border-t border-slate-100 pt-6 sm:pt-8 flex-wrap gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-slate-800">
              תוספות לבחירה
            </span>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase">
              בחירה מרובה
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {ungrouped.map(ingredient => (
              <IngredientRow 
                key={ingredient.id}
                ingredient={ingredient}
                isSelected={selectedIngredients.has(ingredient.id)}
                isSingle={false}
                onToggle={() => onIngredientToggle(
                  ingredient.id, 
                  'multiple', 
                  ingredient.ingredient_category
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable Row Component for cleaner code
 * Memoized to prevent unnecessary re-renders
 */
interface IngredientRowProps {
  ingredient: CustomIngredient;
  isSelected: boolean;
  onToggle: () => void;
  isSingle: boolean;
}

const IngredientRow = memo<IngredientRowProps>(
  function IngredientRow({ ingredient, isSelected, onToggle, isSingle }) {
    const price = ingredient.price_override ?? ingredient.price;

    return (
      <label
        className={cn(
          "group relative flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none",
          isSelected
            ? "border-purple-600 bg-purple-50/40 shadow-md translate-y-[-1px]"
            : "border-slate-100 bg-white hover:border-purple-200 active:scale-[0.98]"
        )}
      >
        <input
          type={isSingle ? 'radio' : 'checkbox'}
          checked={isSelected}
          onChange={onToggle}
          className="sr-only"
        />

        {/* Visual Indicator */}
        <div className={cn(
          "w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ml-3 sm:ml-4 flex items-center justify-center transition-all duration-300",
          isSingle ? "rounded-full" : "rounded-lg",
          isSelected
            ? "bg-purple-600 border-purple-600"
            : "border-2 border-slate-200 bg-slate-50"
        )}>
          {isSelected && (
            isSingle
              ? <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white animate-in zoom-in-50" />
              : <Check size={14} className="sm:w-4 sm:h-4 text-white animate-in zoom-in-50" strokeWidth={3} />
          )}
        </div>

        {/* Image */}
        <div className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 ml-3 sm:ml-5 rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center transition-transform",
          isSelected ? "scale-105" : "group-hover:scale-105"
        )}>
           {ingredient.image ? (
            <OptimizedImage
              src={ingredient.image}
              alt={ingredient.name}
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-xl sm:text-2xl opacity-20">🥤</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-right min-w-0">
          <p className={cn(
            "text-base sm:text-lg font-bold leading-tight transition-colors truncate",
            isSelected ? "text-purple-900" : "text-slate-800"
          )}>
            {translateToHebrew(ingredient.name)}
          </p>
          <p className={cn(
            "text-sm font-black mt-0.5 sm:mt-1",
            price > 0 ? (isSelected ? "text-purple-600" : "text-slate-400") : "text-emerald-500"
          )}>
            {price > 0 ? `+ ₪${Number(price).toFixed(0)}` : 'חינם'}
          </p>
        </div>
      </label>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: return true if props are equal (don't re-render)
    return (
      prevProps.ingredient.id === nextProps.ingredient.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isSingle === nextProps.isSingle
    );
  }
);