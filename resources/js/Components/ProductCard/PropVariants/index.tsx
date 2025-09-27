// resources/js/Components/ProductCard/PropVariants/index.tsx
import { IPropVariants } from '@/Types/prodcard';
import StickVariants from './StickVariants';
import BallVariants from './BallVariants';
import BladeVariants from './BladeVariants';
import GoailiePantsVariants from './GoailiePantsVariants';
import GoalieSizesVariants from './GoalieSizesVariants';
import ProductSizesVariants from './ProductSizesVariants';
import UniversalSizeVariants from './UniversalSizeVariants';

// Категории, использующие универсальный компонент размеров

// Определяем типы
type SizeCategoryId = 10 | 12 | 13 | 14 | 15 | 17;

// Константы с типизацией
const SIZE_CATEGORIES: Record<SizeCategoryId, string> = {
    10: 'pants_size',       // вратарские штаны
    12: 'knees_size',       // вратарские наколенники
    13: 'gloves_size',      // вратарские перчатки
    14: 'groins_size',      // вратарские защита паха
    15: 'necks_size',       // вратарские защита шеи
    17: 'baules_size',      // размер сумок
};

const SIZE_LABELS: Record<string, string> = {
    pants_size : 'Размер штанов',
    knees_size : 'Размер наколенников', 
    gloves_size: 'Размер перчаток',
    groins_size: 'Размер защита паха',
    necks_size : 'Размер защита шеи',
    baules_size: 'Обьём',
};

// Хелпер для проверки
const isSizeCategory = (id: number): id is SizeCategoryId => {
    return Object.keys(SIZE_CATEGORIES).includes(id.toString());
};


interface Props {
  propVariants: IPropVariants;
  categoryId: number; // Добавляем категорию
}

const PropVariants: React.FC<Props> = ({ propVariants, categoryId }) => {

  // Если категория использует универсальные размеры
  if (isSizeCategory(categoryId)) {
    const sizeKey = SIZE_CATEGORIES[categoryId];
    return (
        <UniversalSizeVariants 
            propVariants={propVariants}
            sizeType={SIZE_LABELS[sizeKey] || 'Размер'}
        />
    );
  }
    
  // Специальные случаи
  switch (categoryId) {
    case 1:   // Клюшки
      return <StickVariants propVariants={propVariants} />;
    case 2:   // Крюки
      return <BladeVariants propVariants={propVariants} />;
    case 3:   // Мячи
      return <BallVariants propVariants={propVariants} />;
    case 10:  // Вратарские штаны
      return <GoailiePantsVariants propVariants={propVariants} />;
    case 12:  // Вратарские наколенники
      return <GoalieSizesVariants propVariants={propVariants} />;
    case 13:  // Вратарские перчатки как продукт в общем
      return <ProductSizesVariants propVariants={propVariants} />;
    default:
      return null; // fallback-компонент - пустой блок, без вывода вариантов для карточки товара - только этот товар ... 
  }
};

export default PropVariants;