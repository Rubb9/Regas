import React from 'react';
import {
  ShoppingCart,
  Utensils,
  Car,
  Home,
  HeartPulse,
  Film,
  Zap,
  Shirt,
  GraduationCap,
  Tag,
  ShieldCheck,
  Palmtree,
  Laptop,
  HelpCircle,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  color,
  size,
}) => {
  const iconProps = {
    className,
    style: color ? { color } : undefined,
    size,
  };

  switch (name) {
    case 'ShoppingCart':
      return <ShoppingCart {...iconProps} />;
    case 'Utensils':
      return <Utensils {...iconProps} />;
    case 'Car':
      return <Car {...iconProps} />;
    case 'Home':
      return <Home {...iconProps} />;
    case 'HeartPulse':
      return <HeartPulse {...iconProps} />;
    case 'Film':
      return <Film {...iconProps} />;
    case 'Zap':
      return <Zap {...iconProps} />;
    case 'Shirt':
      return <Shirt {...iconProps} />;
    case 'GraduationCap':
      return <GraduationCap {...iconProps} />;
    case 'ShieldCheck':
      return <ShieldCheck {...iconProps} />;
    case 'Palmtree':
      return <Palmtree {...iconProps} />;
    case 'Laptop':
      return <Laptop {...iconProps} />;
    case 'Tag':
    default:
      return <Tag {...iconProps} />;
  }
};
