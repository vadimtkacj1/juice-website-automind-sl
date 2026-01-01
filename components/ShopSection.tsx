import Link from 'next/link';
import { products } from '@/lib/products';
import { translateToHebrew } from '@/lib/translations';

export default function ShopSection() {
  return (
    <section className="shop-section">
      <h2 className="shop-main-title reveal">{translateToHebrew('Roasted goodness!')}</h2>
      <div className="shop-grid">
        {products.slice(0, 3).map((product, index) => (
          <Link
            key={product.slug}
            href={`/shop/${product.slug}`}
            className="card-shop reveal"
            style={{ ['--delay' as string]: `${0.1 * (index + 1)}s` }}
          >
            <div className="card-img-wrapper">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="card-footer-info">
              <div className="product-text">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
              </div>
              <div className="price-pill">{product.price}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
