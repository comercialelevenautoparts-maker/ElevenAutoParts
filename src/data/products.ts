import productPalheta from '@/assets/product-palheta.jpg';
import productConnector from '@/assets/product-connector.jpg';
import productRubber from '@/assets/product-rubber.jpg';
import productConnector2 from '@/assets/product-connector2.jpg';
import productWiper2 from '@/assets/product-wiper2.jpg';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Par de Palhetas do Limpador de Parabrisa',
    description: 'Premium',
    price: 89.99,
    image: productPalheta,
    category: 'palhetas',
  },
  {
    id: '2',
    name: 'Borracha de Vedação',
    description: 'Universal',
    price: 45.99,
    image: productRubber,
    category: 'borrachas',
  },
  {
    id: '3',
    name: 'Conector Premium',
    description: 'Alta durabilidade',
    price: 65.99,
    image: productConnector,
    category: 'conectores',
  },
  {
    id: '4',
    name: 'Par de Palhetas Pro',
    description: 'Linha profissional',
    price: 129.99,
    image: productWiper2,
    category: 'palhetas',
  },
  {
    id: '5',
    name: 'Conector Universal',
    description: 'Compatível com todos',
    price: 39.99,
    image: productConnector2,
    category: 'conectores',
  },
  {
    id: '6',
    name: 'Palheta Silicone',
    description: 'Longa duração',
    price: 74.99,
    image: productPalheta,
    category: 'palhetas',
  },
  {
    id: '7',
    name: 'Kit Borrachas',
    description: 'Kit completo',
    price: 119.99,
    image: productRubber,
    category: 'borrachas',
  },
  {
    id: '8',
    name: 'Conector Reforçado',
    description: 'Extra resistente',
    price: 54.99,
    image: productConnector,
    category: 'conectores',
  },
];

export const categories = [
  { id: 'todos', label: 'TODOS' },
  { id: 'palhetas', label: 'PALHETAS' },
  { id: 'borrachas', label: 'BORRACHAS' },
];

export const getProductsByCategory = (categoryId: string): Product[] => {
  if (categoryId === 'todos') return products;
  return products.filter((p) => p.category === categoryId);
};
