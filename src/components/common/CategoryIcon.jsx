import React from 'react';
import {
  Smartphone,
  FileText,
  Briefcase,
  Key,
  Watch,
  Shirt,
  Heart,
  Package,
} from 'lucide-react';

const ICON_MAP = {
  electronics: Smartphone,
  documents: FileText,
  bags: Briefcase,
  keys: Key,
  accessories: Watch,
  clothing: Shirt,
  pets: Heart,
  others: Package,
};

export const CategoryIcon = ({ categoryId, className = 'w-5 h-5' }) => {
  const IconComponent = ICON_MAP[categoryId] || Package;
  return <IconComponent className={className} />;
};
