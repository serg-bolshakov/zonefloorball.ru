// resources/js/Components/ProductCard/PropVariants/index.tsx
import { IPropVariants } from '@/Types/prodcard';
import StickVariants from './StickVariants';
// import BallVariants from './BallVariants';
// import HookVariants from './HookVariants';

interface Props1 {
  propVariants: IPropVariants;
  categoryId: number; // Добавляем категорию
}

const PropVariants1: React.FC<Props1> = ({ propVariants, categoryId }) => {
  switch (categoryId) {
    case 1: // Клюшки
      return <StickVariants propVariants={propVariants} />;
    // case 2: // Мячи
    //   return <BallVariants propVariants={propVariants} />;
    // case 3: // Крюки
    //   return <HookVariants propVariants={propVariants} />;
    default:
      return null; // fallback-компонент - пустой блок, без вывода вариантов для карточки товара - только этот товар ... 
  }
};

export default PropVariants1;