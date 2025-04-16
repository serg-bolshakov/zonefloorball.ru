// resources/js/Components/ProductCard/PropVariants/index.tsx
import { IPropVariants } from '@/Types/prodcard';
import StickVariants from './StickVariants';
import BladeVariants from '../BladeVariants';
import BallVariants from './BallVariants';
// import HookVariants from './HookVariants';

interface Props {
  propVariants: IPropVariants;
  categoryId: number; // Добавляем категорию
}

const PropVariants: React.FC<Props> = ({ propVariants, categoryId }) => {
  switch (categoryId) {
    case 1: // Клюшки
      return <StickVariants propVariants={propVariants} />;
    case 2: // Крюки
      return <BladeVariants propVariants={propVariants} />;
    case 3: // Мячи
      return <BallVariants propVariants={propVariants} />;
    default:
      return null; // fallback-компонент - пустой блок, без вывода вариантов для карточки товара - только этот товар ... 
  }
};

export default PropVariants;