export type Product = {
  slug: string;
  name: string;
  description: string;
  price: string;
  image: string;
  roast: string;
  origin: string;
  tasting: string;
  availability: string;
};

export const products: Product[] = [
  {
    slug: 'kozmo',
    name: 'Kozmo',
    description: 'Ground coffee, medium roast with bright citrus.',
    price: '$19.99',
    image: '',
    roast: 'Medium',
    origin: 'Brazil & Colombia',
    tasting: 'Citrus, caramel, milk chocolate',
    availability: 'In stock',
  },
  {
    slug: 'lunar',
    name: 'Lunar',
    description: 'Ground coffee, light roast with floral sweetness.',
    price: '$24.99',
    image: '',
    roast: 'Light',
    origin: 'Ethiopia',
    tasting: 'Jasmine, apricot, honey',
    availability: 'Limited',
  },
  {
    slug: 'the-one',
    name: 'The One',
    description: 'Ground coffee, dark roast for bold cups.',
    price: '$14.99',
    image: '',
    roast: 'Dark',
    origin: 'Sumatra',
    tasting: 'Cocoa, molasses, toasted nuts',
    availability: 'In stock',
  },
  {
    slug: 'arkan',
    name: 'Arkan',
    description: 'Balanced everyday blend with creamy texture.',
    price: '$17.50',
    image: '',
    roast: 'Medium',
    origin: 'Guatemala',
    tasting: 'Vanilla, almond, cacao nibs',
    availability: 'In stock',
  },
  {
    slug: 'nairo',
    name: 'Nairo',
    description: 'Juicy and sweet single-origin for filters.',
    price: '$21.00',
    image: '',
    roast: 'Light',
    origin: 'Kenya',
    tasting: 'Blackcurrant, grapefruit, cane sugar',
    availability: 'In stock',
  },
  {
    slug: 'krishna',
    name: 'Krishna',
    description: 'Chocolate-forward espresso companion.',
    price: '$18.00',
    image: '',
    roast: 'Medium-Dark',
    origin: 'India',
    tasting: 'Baker’s chocolate, spice, molasses',
    availability: 'Few bags left',
  },
];

