// MobileCategoriesDropdown.tsx
import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';


const MobileCategoriesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { categories } = usePage().props; // или через props
  
  return (
    <div className="mobile-categories-container">
      <button 
        className="mobile-categories-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>📁 Категории товаров</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="categories-dropdown">
          {categories.map(category => (
            <Link 
              key={category.id} 
              href={`/products/${category.slug}`}
              className="category-link"
              onClick={() => setIsOpen(false)}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};