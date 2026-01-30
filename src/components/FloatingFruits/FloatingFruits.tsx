'use client';

import { useEffect, useState } from 'react';
import styles from './FloatingFruits.module.css';

interface Fruit {
  id: number;
  image: string;
  animationDuration: number;
  animationDelay: number;
  size: number;
  initialX: number;
  initialY: number;
  animationPattern: number;
}

export default function FloatingFruits() {
  const [fruits, setFruits] = useState<Fruit[]>([]);

  useEffect(() => {
    const fruitImages = [
      '/images/apple.png',
      '/images/strawberry.png',
      '/images/rasberry.png',
      '/images/pomegranate.png',
      '/images/banana.png',
      '/images/plum.png',
      '/images/pineapple.png',
      '/images/grapes.png',
      '/images/qiwi.png',
    ];

    const generateFruits = () => {
      const newFruits: Fruit[] = [];
      const count = 25; // оптимальное количество для заполнения экрана

      for (let i = 0; i < count; i++) {
        // Ограничиваем позиции фруктов для предотвращения обрезания на краях
        // Используем безопасную зону: 5-95% вместо 0-100%
        const safeMargin = 5; // 5% отступ с каждой стороны
        const initialX = safeMargin + Math.random() * (100 - 2 * safeMargin);
        const initialY = safeMargin + Math.random() * (100 - 2 * safeMargin);

        newFruits.push({
          id: i,
          image: fruitImages[Math.floor(Math.random() * fruitImages.length)],
          animationDuration: 15 + Math.random() * 20, // 15-35 секунд - медленная плавная анимация
          animationDelay: Math.random() * -25, // отрицательная задержка для хаотичного старта
          size: 40 + Math.random() * 100, // размер 40-140px
          initialX, // безопасная позиция по X (5-95%)
          initialY, // безопасная позиция по Y (5-95%)
          animationPattern: Math.floor(Math.random() * 5), // 5 разных паттернов движения
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
          className={`${styles.floatingFruit} ${styles[`pattern${fruit.animationPattern}` as keyof typeof styles]}`}
          style={{
            left: `${fruit.initialX}%`,
            top: `${fruit.initialY}%`,
            width: `${fruit.size}px`,
            height: `${fruit.size}px`,
            animationDuration: `${fruit.animationDuration}s`,
            animationDelay: `${fruit.animationDelay}s`,
          }}
        >
          <img
            src={fruit.image}
            alt="fruit"
            width={fruit.size}
            height={fruit.size}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px rgba(237, 129, 14, 0.3))',
            }}
          />
        </div>
      ))}
    </div>
  );
}
