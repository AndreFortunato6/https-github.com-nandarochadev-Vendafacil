export type Category = 'Bebida' | 'Sobremesa' | 'Salgado' | 'Outros';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type View = 'pdv' | 'estoque' | 'historico' | 'relatorios' | 'config';

export interface StoreInfo {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'dinheiro' | 'cartao' | 'pix';
  timestamp: Date;
}
