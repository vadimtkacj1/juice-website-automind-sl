'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useCart } from '@/lib/cart-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductModal from '@/components/ProductModal';
import { ShoppingBag } from 'lucide-react';

const ITEMS_PER_LOAD = 6;

interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  volume?: string;
  image?: string;
  discount_percent: number;
  is_available: boolean;
  categoryVolumes?: Array<{ volume: string; is_default: boolean; sort_order: number }>; // All volumes for this category
}

interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  items: MenuItem[];
}

export default function MenuPage() {
  const [allMenuItems, setAllMenuItems] = useState<MenuCategory[]>([]);
  const [displayedMenu, setDisplayedMenu] = useState<MenuCategory[]>([]);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_LOAD);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const { addToCart } = useCart();
  const observerTarget = useRef<HTMLDivElement>(null);

  const processAndSetMenu = useCallback(async (data: MenuCategory[]) => {
    const newMenu: MenuCategory[] = [];
    
    // Process each category and fetch volumes
    for (const category of data) {
      if (category.items && category.items.length > 0) {
        // Fetch category volumes
        let categoryVolumes: any[] = [];
        try {
          const volumesRes = await fetch(`/api/menu-categories/${category.id}/volumes`);
          const volumesData = await volumesRes.json();
          categoryVolumes = volumesData.volumes || [];
        } catch (err) {
          console.error('Error fetching category volumes:', err);
        }

        // Sort volumes by sort_order
        const sortedVolumes = [...categoryVolumes].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        // Update items with all volume info
        const itemsWithVolumes = category.items.map(item => {
          if (sortedVolumes.length > 0) {
            return {
              ...item,
              categoryVolumes: sortedVolumes, // Store all volumes for this category
            };
          }
          return item;
        });

        newMenu.push({
          ...category,
          items: itemsWithVolumes,
        });
      }
    }
    
    setAllMenuItems(newMenu);
    setDisplayedMenu(newMenu.map(cat => ({ ...cat, items: cat.items.slice(0, ITEMS_PER_LOAD) })));
    setHasMore(newMenu.some(cat => cat.items.length > ITEMS_PER_LOAD));
  }, []);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        await processAndSetMenu(data.menu || []);
      }
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [processAndSetMenu]);

  const loadMoreItems = useCallback(() => {
    setLoadingMore(true);
    console.log('Loading more items...', { displayLimit, hasMore });
    const newLimit = displayLimit + ITEMS_PER_LOAD;
    
    const newDisplayedMenu = allMenuItems.map(category => {
      const currentlyDisplayed = category.items.slice(0, displayLimit);
      const newItems = category.items.slice(displayLimit, newLimit);
      return { ...category, items: [...currentlyDisplayed, ...newItems] };
    });
    setDisplayedMenu(newDisplayedMenu);
    setDisplayLimit(newLimit);
    setHasMore(allMenuItems.some(cat => cat.items.length > newLimit));
    setLoadingMore(false);
  }, [allMenuItems, displayLimit]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    if (!loading && allMenuItems.length > 0) {
      const revealElements = document.querySelectorAll('.reveal');
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
            }
          });
        },
        { threshold: 0.1 }
      );

      revealElements.forEach((el) => observer.observe(el));

      setTimeout(() => {
        revealElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight) {
            el.classList.add('active');
          }
        });
      }, 100);

      return () => observer.disconnect();
    }
  }, [loading, allMenuItems]);

  useEffect(() => {
    console.log('Setting up IntersectionObserver for load more', { loadingMore, hasMore });
    if (loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        console.log('Load more trigger intersected');
        loadMoreItems();
      }
    }, { threshold: 1.0 });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadingMore, hasMore, loadMoreItems]);

  function handleAddToCart(item: MenuItem & { volume?: string, addons?: any[], customIngredients?: any[] }) {
    const finalPrice = item.discount_percent > 0 
      ? item.price * (1 - item.discount_percent / 100) 
      : item.price;
    
    console.log('handleAddToCart in menu page - item:', item);
    console.log('handleAddToCart in menu page - customIngredients:', item.customIngredients);
    
    addToCart({
      id: item.id,
      name: item.name,
      price: finalPrice,
      image: item.image,
      volume: item.volume,
      addons: item.addons,
      customIngredients: item.customIngredients,
    });
  }

  function getDiscountedPrice(price: number, discountPercent: number) {
    if (discountPercent > 0) {
      return price * (1 - discountPercent / 100);
    }
    return price;
  }

  if (loading && allMenuItems.length === 0) {
    return (
      <div className="menu-page">
        <div className="menu-loading">
          <LoadingSpinner size="lg" text="Loading delicious menu..." fullPage />
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <div className="menu-error">
          <p>{error}</p>
          <button onClick={fetchMenu} className="retry-btn">
            Try again
          </button>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (allMenuItems.length === 0 && !loading) {
    return (
      <div className="menu-page">
        <div className="menu-empty">
          <h2>Menu is empty</h2>
          <p>Delicious items coming soon!</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="menu-page">
      {/* Header */}
      <header className="menu-header reveal">
        <div className="menu-header-content">
          <h1 className="menu-title">OUR MENU</h1>
          <p className="menu-subtitle">Fresh, natural, and absolutely delicious</p>
        </div>
      </header>

      {/* Categories */}
      {displayedMenu.map((category, categoryIdx) => (
        <section
          key={category.id}
          className="category-section reveal"
          style={{ ['--delay' as string]: `${0.1 * categoryIdx}s` }}
        >
          <div className="category-header">
            <h2 className="category-title">{category.name}</h2>
            {category.description && (
              <p className="category-desc">{category.description}</p>
            )}
          </div>

          <div className="products-grid">
            {category.items.map((item, itemIdx) => (
              <div
                key={item.id}
                className="product-card reveal"
                style={{ ['--delay' as string]: `${0.05 * (itemIdx + 1)}s` }}
                onClick={() => {
                  // Ensure category_id is included
                  setSelectedItem({ ...item, category_id: item.category_id || category.id });
                }}
              >
                {/* Discount Badge */}
                {item.discount_percent > 0 && (
                  <div className="discount-badge">-{item.discount_percent}%</div>
                )}

                {/* Image */}
                <div className="product-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="product-image-placeholder">
                      <ShoppingBag size={40} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="product-info">
                  <div className="product-text">
                    <h3 className="product-name">{item.name}</h3>
                    {item.description && (
                      <p className="product-desc">{item.description}</p>
                    )}
                  </div>

                  <div className="product-footer">
                    {item.categoryVolumes && item.categoryVolumes.length > 0 ? (
                      <div className="volumes-list">
                        {item.categoryVolumes.map((vol, volIdx) => {
                          const volPrice = getDiscountedPrice(item.price, item.discount_percent);
                          return (
                            <div key={volIdx} className="volume-badge">
                              <span className="volume-label">{vol.volume}</span>
                              <span className="volume-separator">•</span>
                              <span className="volume-price">₪{volPrice.toFixed(0)}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="price-badge">
                        {item.discount_percent > 0 && (
                          <span className="price-old">₪{item.price.toFixed(0)}</span>
                        )}
                        <span className="price-current">
                          ₪{getDiscountedPrice(item.price, item.discount_percent).toFixed(0)}
                        </span>
                      </div>
                    )}
                    <button 
                      className="add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <span>+</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {hasMore && (
        <div ref={observerTarget} className="load-more-trigger">
          <LoadingSpinner size="md" text="Loading more items..." />
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={(item) => handleAddToCart(item as MenuItem)}
      />

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .menu-page {
    padding-bottom: 80px;
  }

  /* Header */
  .menu-header {
    background: var(--primary, #7322ff);
    border-radius: 24px;
    margin: 120px 16px 48px;
    padding: 80px 24px;
    text-align: center;
  }

  .menu-header-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .menu-title {
    font-family: "Archivo", sans-serif;
    font-weight: 900;
    font-size: clamp(60px, 12vw, 120px);
    color: white;
    margin: 0;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .menu-subtitle {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.9);
    margin: 20px 0 0;
  }

  /* Loading, Error, Empty States */
  .menu-loading,
  .menu-error,
  .menu-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 120px 20px;
    text-align: center;
  }

  .retry-btn {
    margin-top: 20px;
    padding: 14px 32px;
    background: var(--primary, #7322ff);
    color: white;
    border: none;
    border-radius: 100px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(115, 34, 255, 0.3);
  }

  /* Category Section */
  .category-section {
    padding: 0 16px;
    margin-bottom: 60px;
  }

  .category-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .category-title {
    font-family: "Archivo", sans-serif;
    font-weight: 900;
    font-size: 42px;
    color: var(--dark, #1d1a40);
    margin: 0 0 12px;
  }

  .category-desc {
    font-size: 16px;
    color: var(--text-gray, #70758c);
    margin: 0;
    max-width: 500px;
    margin: 0 auto;
  }

  /* Products Grid */
  .products-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Product Card */
  .product-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15);
    box-shadow: 0 4px 20px rgba(29, 26, 64, 0.06);
    cursor: pointer;
  }

  .product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 50px rgba(29, 26, 64, 0.12);
  }

  /* Discount Badge */
  .discount-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    background: #e53935;
    color: white;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 800;
    z-index: 2;
  }

  /* Product Image */
  .product-image {
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    background: var(--gray-bg, #eaedf6);
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.15);
  }

  .product-card:hover .product-image img {
    transform: scale(1.08);
  }

  .product-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-gray, #70758c);
  }

  /* Product Info */
  .product-info {
    padding: 20px;
  }

  .product-text {
    margin-bottom: 16px;
  }

  .product-name {
    font-family: "Archivo", sans-serif;
    font-weight: 800;
    font-size: 18px;
    color: var(--dark, #1d1a40);
    margin: 0 0 6px;
    line-height: 1.3;
  }

  .product-desc {
    font-size: 14px;
    color: var(--text-gray, #70758c);
    margin: 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Product Footer */
  .product-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .price-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--gray-bg, #eaedf6);
    padding: 10px 18px;
    border-radius: 100px;
  }

  .price-old {
    font-size: 14px;
    color: var(--text-gray, #70758c);
    text-decoration: line-through;
  }

  .price-current {
    font-family: "Archivo", sans-serif;
    font-weight: 800;
    font-size: 16px;
    color: var(--dark, #1d1a40);
  }

  .price-volume {
    font-size: 12px;
    color: var(--text-gray, #70758c);
    margin-left: 4px;
  }

  .volumes-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .volume-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #f8f9fa 0%, #eaedf6 100%);
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 13px;
    border: 1px solid rgba(115, 34, 255, 0.1);
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  }

  .volume-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(115, 34, 255, 0.12);
    border-color: rgba(115, 34, 255, 0.2);
  }

  .volume-label {
    color: var(--dark, #1d1a40);
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.02em;
  }

  .volume-separator {
    color: var(--text-gray, #70758c);
    font-weight: 300;
    opacity: 0.5;
  }

  .volume-price {
    font-family: "Archivo", sans-serif;
    font-weight: 800;
    font-size: 15px;
    color: var(--primary, #7322ff);
    letter-spacing: -0.01em;
  }

  .add-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: var(--primary, #7322ff);
    color: white;
    font-size: 24px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.15);
    flex-shrink: 0;
  }

  .add-btn:hover {
    transform: scale(1.1) rotate(90deg);
    background: var(--dark, #1d1a40);
  }

  .add-btn span {
    line-height: 1;
    margin-top: -2px;
  }

  /* Responsive */
  @media (max-width: 1100px) {
    .products-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 700px) {
    .products-grid {
      grid-template-columns: 1fr;
      max-width: 400px;
    }

    .menu-header {
      margin: 100px 12px 36px;
      padding: 60px 20px;
    }

    .menu-title {
      font-size: 56px;
    }

    .category-section {
      padding: 0 12px;
    }

    .category-title {
      font-size: 32px;
    }

    .product-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .volumes-list {
      width: 100%;
    }

    .add-btn {
      align-self: flex-end;
    }
  }

  .load-more-trigger {
    display: flex;
    justify-content: center;
    padding: 40px 0;
  }
`;
