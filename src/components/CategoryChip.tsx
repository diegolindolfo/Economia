import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Utensils,
  HeartPulse,
  ShoppingBag,
  Tv,
  CircleEllipsis,
  Home,
  GraduationCap,
} from 'lucide-react';
import { Category, CategorySource } from '../types';
import { CATEGORIES } from '../lib/categorization/categories';

interface CategoryChipProps {
  category: Category;
  source?: CategorySource;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent) => void;
  interactive?: boolean;
  showSourceDot?: boolean;
  className?: string;
}

export const CategoryIcon: React.FC<{ category: Category; size?: number; className?: string }> = ({
  category,
  size = 14,
  className = '',
}) => {
  switch (category) {
    case 'receita':
      return <ArrowDownLeft size={size} className={className} />;
    case 'investimento':
      return <TrendingUp size={size} className={className} />;
    case 'moradia':
      return <Home size={size} className={className} />;
    case 'educacao':
      return <GraduationCap size={size} className={className} />;
    case 'alimentacao':
      return <Utensils size={size} className={className} />;
    case 'saude':
      return <HeartPulse size={size} className={className} />;
    case 'compras':
      return <ShoppingBag size={size} className={className} />;
    case 'assinaturas':
      return <Tv size={size} className={className} />;
    case 'transferencia':
      return <ArrowUpRight size={size} className={className} />;
    case 'outros':
    default:
      return <CircleEllipsis size={size} className={className} />;
  }
};

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  source,
  size = 'md',
  onClick,
  interactive = false,
  showSourceDot = false,
  className = '',
}) => {
  const cat = CATEGORIES[category] || CATEGORIES.outros;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1 min-h-[26px]',
    md: 'px-2.5 py-1 text-xs sm:text-sm gap-1.5 min-h-[32px]',
    lg: 'px-3.5 py-2 text-sm sm:text-base gap-2 min-h-[44px]',
  }[size];

  const Component = interactive ? 'button' : 'span';

  return (
    <Component
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      style={{
        backgroundColor: cat.bgColor,
        color: cat.color,
        borderColor: cat.borderColor,
      }}
      className={`inline-flex items-center rounded-full font-medium border whitespace-nowrap transition-all duration-150 select-none ${sizeClasses} ${
        interactive
          ? 'hover:brightness-95 active:scale-95 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#1E241F]/30'
          : ''
      } ${className}`}
      title={interactive ? `Clique para alterar categoria de ${cat.label}` : cat.label}
    >
      <CategoryIcon category={category} size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />
      <span className="truncate">{cat.label}</span>
      {showSourceDot && source === 'regra' && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current opacity-70 ml-0.5"
          title="Classificado por regra aprendida"
        />
      )}
    </Component>
  );
};
