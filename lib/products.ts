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
    image: 'https://framerusercontent.com/images/NXttOnsmf4ONyIuiMGkBzv7ECU.jpg',
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
    image: 'https://framerusercontent.com/images/nuTc250d2Y6Wnx4FdH82PqKsYA.jpg',
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
    image: 'https://framerusercontent.com/images/2mnN6p3fJB8lHlsdZ1TEjQv2ayU.jpg',
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
    image: 'https://framerusercontent.com/images/ORMEanL6Ba8E2aUWLw4TBq74vLI0a20.jpg',
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
    image: 'https://framerusercontent.com/images/Wx09BkY53p7pbwO9DwKOXPEOaQ0a20.jpg',
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
    image: 'https://framerusercontent.com/images/2OLkQWZEHwAeg6FGqrjEUY1x0M0a20.jpg',
    roast: 'Medium-Dark',
    origin: 'India',
    tasting: 'Baker’s chocolate, spice, molasses',
    availability: 'Few bags left',
  },
];

