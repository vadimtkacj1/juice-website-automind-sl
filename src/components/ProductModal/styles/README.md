# ProductModal CSS Architecture

This directory contains the modular CSS architecture for the ProductModal component, replacing the monolithic `ProductModal.module.css` file.

## 📁 File Structure

```
styles/
├── ProductModalBase.module.css        # Base container, backdrop, close button
├── ProductModalHeader.module.css      # Title, price, subtitle, discount
├── ProductModalImage.module.css       # Product image display
├── ProductModalFeatures.module.css    # Feature badges/pills
├── VolumeSelector.module.css          # Size/volume selection
├── IngredientsSection.module.css      # Custom ingredients selector
├── AdditionalItemsSection.module.css  # Extra options/add-ons
└── ProductModalFooter.module.css      # Total price and cart button

Global styles:
└── src/app/styles/product-modal-variables.css  # Shared CSS variables and animations
```

## 📦 Module Mapping

| Component | CSS Module | Description |
|-----------|-----------|-------------|
| `ProductModal.tsx` | `ProductModalBase.module.css` | Main modal wrapper, backdrop, container |
| `ProductModalHeader.tsx` | `ProductModalHeader.module.css` | Header with title and pricing |
| `ProductModalImage.tsx` | `ProductModalImage.module.css` | Product image display panel |
| `ProductModalFeatures.tsx` | `ProductModalFeatures.module.css` | Feature badges |
| `VolumeSelector.tsx` | `VolumeSelector.module.css` + `ProductModalBase.module.css` | Volume selection grid |
| `IngredientsSection.tsx` | `IngredientsSection.module.css` | Ingredients selector (uses Tailwind primarily) |
| `AdditionalItemsSection.tsx` | `AdditionalItemsSection.module.css` + `ProductModalBase.module.css` | Additional options |
| `ProductModalFooter.tsx` | `ProductModalFooter.module.css` | Footer with total and button |

## 🎨 Shared Variables

All modules use CSS variables defined globally in `src/app/styles/product-modal-variables.css`:

```css
--modal-bg: #ffffff;
--modal-text-primary: #1d1a40;
--modal-text-secondary: #70758c;
--modal-accent: #1d1a40;
--modal-accent-hover: #2d2a50;
--modal-border: rgba(29, 26, 64, 0.12);
--modal-bg-secondary: #f8f9fc;
--modal-shadow: 0 20px 60px rgba(29, 26, 64, 0.2);
--modal-radius: 16px;
--font-family: "Heebo", sans-serif;
```

**Note**: These variables are loaded globally via `src/app/globals.css`, so no import is needed in individual CSS modules.

## 🔄 Migration Notes

- **Old file**: `ProductModal.module.css` (1109 lines) → backed up as `ProductModal.module.css.old`
- **New structure**: 8 focused CSS modules (~150-200 lines each) + 1 global variables file
- **Benefits**:
  - Better code organization and separation of concerns
  - Easier maintenance and debugging
  - Faster development with focused files
  - Smaller bundle sizes (with proper tree-shaking)
  - Clear component-to-style mapping
  - No CSS import errors with CSS modules

## 📝 Usage Example

```tsx
// Before (monolithic)
import styles from './ProductModal.module.css';

// After (modular)
import styles from './styles/ProductModalHeader.module.css';

// For components that need base section styles
import baseStyles from './styles/ProductModalBase.module.css';

// Example in VolumeSelector.tsx
<div className={baseStyles['modal-section']}>
  <h3 className={baseStyles['section-title']}>
    {translateToHebrew('Select Size')}
  </h3>
  <div className={styles['volume-grid']}>
    {/* Volume options */}
  </div>
</div>
```

## ⚠️ Important Notes

1. **Global Variables**: CSS variables are defined in `src/app/styles/product-modal-variables.css` and loaded globally via `globals.css`. **Do not** use `@import` to load these in CSS modules, as it will cause build errors.

2. **BaseStyles Pattern**: Components like `VolumeSelector` and `AdditionalItemsSection` import both:
   - Their specific module for component-specific styles
   - `ProductModalBase.module.css` for shared section styles (`modal-section`, `section-title`)

3. **IngredientsSection**: This component primarily uses Tailwind CSS classes. The `IngredientsSection.module.css` contains additional grid and card styles for specific use cases.

4. **Responsive Design**: All responsive styles are contained within their respective modules to maintain cohesion.

5. **Animations**: Shared animations (`fadeIn`, `slideUp`, `popIn`) are defined globally in `product-modal-variables.css`.

## ✅ Build Status

All modules have been tested and successfully build without errors. The decomposition maintains 100% functionality while improving code organization.

## 🚀 Future Improvements

- [ ] Consider CSS module composition to reduce import duplication
- [ ] Add CSS custom properties for dynamic theming
- [ ] Create utility classes for common patterns
- [ ] Evaluate migration to CSS-in-JS if needed for dynamic styles
