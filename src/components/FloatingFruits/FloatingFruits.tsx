'use client';

import { useEffect, useState } from 'react';
import styles from './FloatingFruits.module.css';

interface Fruit {
  id: number;
  image: string;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  rotation: number;
}

export default function FloatingFruits() {
  const [fruits, setFruits] = useState<Fruit[]>([]);

  useEffect(() => {
    const fruitImages = [
      '/images/apple.webp',
      '/images/strawberry.webp',
      '/images/rasberry.webp',
      '/images/pomegranede.webp',
    ];

    const generateFruits = () => {
      const newFruits: Fruit[] = [];
      const count = 8; // количество фруктов

      for (let i = 0; i < count; i++) {
        newFruits.push({
          id: i,
          image: fruitImages[Math.floor(Math.random() * fruitImages.length)],
          left: Math.random() * 100, // позиция по горизонтали (0-100%)
          animationDuration: 15 + Math.random() * 15, // 15-30 секунд
          animationDelay: Math.random() * 5, // задержка 0-5 секунд
          size: 40 + Math.random() * 60, // размер 40-100px
          rotation: Math.random() * 360, // начальный поворот
        });
      }

      setFruits(newFruits);
    };

    generateFruits();
  }, []);

  return (
    <div className={styles.floatingFruitsContainer}>
      {fruits.map((fruit) => (
        <div
          key={fruit.id}
          className={styles.floatingFruit}
          style={{
            left: `${fruit.left}%`,
            animationDuration: `${fruit.animationDuration}s`,
            animationDelay: `${fruit.animationDelay}s`,
            '--initial-rotation': `${fruit.rotation}deg`,
          } as React.CSSProperties}
        >
          <img
            src={fruit.image}
            alt="fruit"
            width={fruit.size}
            height={fruit.size}
            className={styles.fruitImage}
          />
        </div>
      ))}
    </div>
  );
}
