export type Category = 'Bebida' | 'Sobremesa' | 'Salgado' | 'Outros';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export type View = 'pdv' | 'historico' | 'estoque' | 'relatorios' | 'config';

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'dinheiro' | 'cartao' | 'pix';
  timestamp: Date;
}

export interface StoreInfo {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
}
