import { useState, useMemo } from 'react';
import type { ReactNode, FormEvent } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  BarChart3, 
  Settings, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CheckCircle2, 
  X,
  CreditCard,
  Banknote,
  QrCode,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Layers,
  Database,
  Save,
  PackagePlus,
  Building2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import type { Product, CartItem, View, Sale, StoreInfo, Category } from './types';

const INITIAL_PRODUCTS: Product[] = [
  { id: 'BEB001', name: 'Café Expresso', category: 'Bebida', price: 5.50, stock: 15 },
  { id: 'BEB002', name: 'Suco de Laranja', category: 'Bebida', price: 7.00, stock: 12 },
  { id: 'SOB001', name: 'Bolo de Chocolate', category: 'Sobremesa', price: 7.00, stock: 20 },
  { id: 'SOB002', name: 'Pudim de Leite', category: 'Sobremesa', price: 8.00, stock: 25 },
  { id: 'SAL001', name: 'Sanduíche Natural', category: 'Salgado', price: 9.50, stock: 10 },
  { id: 'SAL002', name: 'Pão de Queijo', category: 'Salgado', price: 3.50, stock: 45 },
];

export default function App() {
  const [view, setView] = useState<View>('pdv');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao' | 'pix' | null>(null);
  
  // Settings state
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: 'Minha Lanchonete',
    cnpj: '00.000.000/0001-00',
    address: 'Rua das Flores, 123',
    phone: '(11) 98765-4321'
  });

  // Product registration state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: '',
    name: '',
    category: 'Bebida',
    price: 0,
    stock: 0
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        if (newQty === 0) return null;
        return { ...item, quantity: Math.min(newQty, item.stock) };
      }
      return item;
    }).filter((item): item is CartItem => item !== null));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const finalizeSale = () => {
    if (!paymentMethod) return;

    const newSale: Sale = {
      id: `VEN-${Date.now().toString().slice(-6)}`,
      items: [...cart],
      total: cartTotal,
      paymentMethod: paymentMethod,
      timestamp: new Date()
    };

    setSales(prev => [newSale, ...prev]);
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    }));
    setCart([]);
    setIsCheckoutOpen(false);
    setPaymentMethod(null);
    alert('Venda finalizada com sucesso!');
  };

  const handleCreateProduct = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProduct.id || !newProduct.name || !newProduct.price) return;
    
    setProducts(prev => [...prev, newProduct as Product]);
    setNewProduct({ id: '', name: '', category: 'Bebida', price: 0, stock: 0 });
    alert('Produto cadastrado com sucesso!');
  };

  const lowStockCount = products.filter(p => p.stock < 10).length;
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);

  const todaySalesTotal = useMemo(() => {
    const today = new Date().toDateString();
    return sales
      .filter(sale => new Date(sale.timestamp).toDateString() === today)
      .reduce((sum, sale) => sum + sale.total, 0);
  }, [sales]);

  // Report Data
  const paymentMethodData = useMemo(() => {
    const data = [
      { name: 'Dinheiro', value: sales.filter(s => s.paymentMethod === 'dinheiro').reduce((sum, s) => sum + s.total, 0) },
      { name: 'Cartão', value: sales.filter(s => s.paymentMethod === 'cartao').reduce((sum, s) => sum + s.total, 0) },
      { name: 'PIX', value: sales.filter(s => s.paymentMethod === 'pix').reduce((sum, s) => sum + s.total, 0) },
    ];
    return data.filter(d => d.value > 0);
  }, [sales]);

  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string, quantity: number }> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!counts[item.id]) counts[item.id] = { name: item.name, quantity: 0 };
        counts[item.id].quantity += item.quantity;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <aside className="w-20 lg:w-64 bg-primary text-white flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold hidden lg:block tracking-tight text-white">VendaFácil</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="PDV" active={view === 'pdv'} onClick={() => setView('pdv')} />
          <SidebarLink icon={<History size={20} />} label="Histórico" active={view === 'historico'} onClick={() => setView('historico')} />
          <SidebarLink icon={<Package size={20} />} label="Estoque" active={view === 'estoque'} onClick={() => setView('estoque')} />
          <SidebarLink icon={<BarChart3 size={20} />} label="Relatórios" active={view === 'relatorios'} onClick={() => setView('relatorios')} />
          <SidebarLink icon={<Settings size={20} />} label="Config." active={view === 'config'} onClick={() => setView('config')} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-lg lg:hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-xs font-bold text-white">AD</div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-white/50">Caixa 01</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full bg-background overflow-hidden text-slate-900">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-semibold text-slate-800 uppercase tracking-wider">
            {view === 'pdv' ? 'Ponto de Venda' : view === 'estoque' ? 'Gestão de Estoque' : view.charAt(0).toUpperCase() + view.slice(1)}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar produto ou código..." 
                className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {view === 'pdv' && (
              <motion.div 
                key="pdv"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-6 h-full"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-auto pb-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />
                  ))}
                </div>

                <div className="w-[400px] bg-white rounded-2xl shadow-sm border border-border flex flex-col shrink-0">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={20} className="text-primary" />
                      <h2 className="font-bold text-slate-800">Venda Atual</h2>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                      {cart.length} itens
                    </span>
                  </div>

                  <div className="flex-1 overflow-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                          <ShoppingCart size={32} />
                        </div>
                        <p className="text-sm font-medium">Seu carrinho está vazio</p>
                      </div>
                    ) : (
                      cart.map(item => (
                        <CartListItem 
                          key={item.id} 
                          item={item} 
                          onUpdateQty={(delta) => updateQuantity(item.id, delta)}
                          onRemove={() => removeFromCart(item.id)}
                        />
                      ))
                    )}
                  </div>

                  <div className="p-6 bg-slate-50 rounded-b-2xl border-t border-border">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-slate-500 font-medium">Subtotal</span>
                      <span className="text-2xl font-black text-slate-800">
                        {cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setCart([])}
                        className="py-3 px-4 rounded-xl border border-border text-slate-600 font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        Limpar
                      </button>
                      <button 
                        onClick={() => setIsCheckoutOpen(true)}
                        disabled={cart.length === 0}
                        className="py-3 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        Finalizar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'estoque' && (
              <motion.div 
                key="estoque"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard icon={<Layers className="text-blue-500" />} label="Total de Produtos" value={products.length.toString()} color="blue" />
                  <StatCard icon={<TrendingUp className="text-emerald-500" />} label="Itens em Estoque" value={totalStockItems.toString()} color="emerald" />
                  <StatCard icon={<AlertTriangle className="text-amber-500" />} label="Estoque Baixo" value={lowStockCount.toString()} color="amber" highlight={lowStockCount > 0} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-border">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cód.</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Produto</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Preço</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Estoque</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-slate-400">{p.id}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                  {p.name.charAt(0)}
                                </div>
                                <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                                {p.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                              {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-center">{p.stock}</td>
                            <td className="px-6 py-4 text-center">
                              {p.stock < 10 ? (
                                <span className="inline-flex items-center justify-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full ring-1 ring-amber-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  Baixo
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full ring-1 ring-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Normal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'historico' && (
              <motion.div 
                key="historico"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatCard icon={<ShoppingCart className="text-blue-500" />} label="Vendas Totais" value={sales.length.toString()} color="blue" />
                  <StatCard icon={<Banknote className="text-emerald-500" />} label="Vendido Hoje" value={todaySalesTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} color="emerald" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h2 className="font-bold text-slate-800">Últimas Vendas</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-border">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cód. Venda</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data/Hora</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Itens</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pagamento</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {sales.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                              Nenhuma venda realizada ainda.
                            </td>
                          </tr>
                        ) : (
                          sales.map(sale => (
                            <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-mono font-bold text-primary">{sale.id}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {new Date(sale.timestamp).toLocaleString('pt-BR')}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs text-slate-500 max-w-xs truncate">
                                  {sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="capitalize text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                                  {sale.paymentMethod}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-black text-slate-800 text-right">
                                {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end p-6 bg-slate-800 rounded-2xl text-white">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Resumo Financeiro Diário</p>
                    <p className="text-3xl font-black">{todaySalesTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'relatorios' && (
              <motion.div 
                key="relatorios"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <CreditCard size={18} className="text-primary" />
                      Vendas por Forma de Pagamento
                    </h3>
                    <div className="h-[300px]">
                      {paymentMethodData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={paymentMethodData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {paymentMethodData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">Sem dados suficientes</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-500" />
                      Produtos Mais Vendidos
                    </h3>
                    <div className="space-y-4">
                      {topProducts.length > 0 ? (
                        topProducts.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{idx + 1}</span>
                              <span className="text-sm font-medium text-slate-700">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-primary">{item.quantity} un.</span>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 py-20">Sem vendas registradas</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <BarChart3 size={18} className="text-primary" />
                      Desempenho de Vendas
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold ring-1 ring-emerald-100">
                      <ArrowRight size={14} className="-rotate-45" />
                      +12.5% vs mês anterior
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Seg', total: todaySalesTotal * 0.8 },
                        { name: 'Ter', total: todaySalesTotal * 0.9 },
                        { name: 'Qua', total: todaySalesTotal * 0.7 },
                        { name: 'Qui', total: todaySalesTotal * 1.1 },
                        { name: 'Sex', total: todaySalesTotal * 1.3 },
                        { name: 'Sab', total: todaySalesTotal * 1.5 },
                        { name: 'Dom', total: todaySalesTotal },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `R$ ${val}`} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="total" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'config' && (
              <motion.div 
                key="config"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Building2 size={20} className="text-primary" />
                      Dados da Empresa
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nome da Empresa</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                          value={storeInfo.name}
                          onChange={(e) => setStoreInfo({...storeInfo, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">CNPJ</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                          value={storeInfo.cnpj}
                          onChange={(e) => setStoreInfo({...storeInfo, cnpj: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Endereço</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            value={storeInfo.address}
                            onChange={(e) => setStoreInfo({...storeInfo, address: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <button className="mt-6 w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                      <Save size={18} />
                      Salvar Alterações
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Database size={20} className="text-primary" />
                      Sistema e Segurança
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <Save size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-700">Backup Manual</p>
                            <p className="text-xs text-slate-400">Exportar todos os dados em JSON</p>
                          </div>
                        </div>
                        <ArrowRight size={18} className="text-slate-300" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                            <Lock size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-700">Alterar Senha</p>
                            <p className="text-xs text-slate-400">Gerenciar permissões de acesso</p>
                          </div>
                        </div>
                        <ArrowRight size={18} className="text-slate-300" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-border shadow-sm h-fit">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <PackagePlus size={20} className="text-primary" />
                    Novo Produto
                  </h3>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Código (ID)</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all uppercase"
                          value={newProduct.id}
                          onChange={(e) => setNewProduct({...newProduct, id: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Categoria</label>
                        <select 
                          className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value as Category})}
                        >
                          <option value="Bebida">Bebida</option>
                          <option value="Sobremesa">Sobremesa</option>
                          <option value="Salgado">Salgado</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nome do Produto</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Preço (R$)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                          value={newProduct.price || ''}
                          onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Estoque Inicial</label>
                        <input 
                          type="number" 
                          required
                          className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                          value={newProduct.stock || ''}
                          onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full mt-4 py-4 bg-primary text-white rounded-xl font-black text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                      Adicionar ao Estoque
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Finalizar Venda</h2>
                <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mb-1">Total a Pagar</p>
                  <p className="text-4xl font-black text-primary">
                    {cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Forma de Pagamento</p>
                  <div className="grid grid-cols-3 gap-4">
                    <PaymentOption 
                      active={paymentMethod === 'dinheiro'} 
                      onClick={() => setPaymentMethod('dinheiro')}
                      icon={<Banknote size={24} />}
                      label="Dinheiro"
                    />
                    <PaymentOption 
                      active={paymentMethod === 'cartao'} 
                      onClick={() => setPaymentMethod('cartao')}
                      icon={<CreditCard size={24} />}
                      label="Cartão"
                    />
                    <PaymentOption 
                      active={paymentMethod === 'pix'} 
                      onClick={() => setPaymentMethod('pix')}
                      icon={<QrCode size={24} />}
                      label="PIX"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-border mt-4">
                <button 
                  onClick={finalizeSale}
                  disabled={!paymentMethod}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/30"
                >
                  Confirmar Pagamento
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }: { icon: ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${active 
          ? 'bg-white text-primary font-bold shadow-lg shadow-black/10' 
          : 'text-white/60 hover:text-white hover:bg-white/5'}
      `}
    >
      <span className={active ? 'text-primary' : 'text-white/60'}>{icon}</span>
      <span className="truncate hidden lg:block">{label}</span>
    </button>
  );
}

function ProductCard({ product, onAdd }: { product: Product, onAdd: () => void, key?: any }) {
  return (
    <div 
      onClick={onAdd}
      className="bg-white rounded-2xl p-4 border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden h-full"
    >
      <div className="absolute top-3 right-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">{product.id}</div>
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-primary mb-3 transition-transform group-hover:scale-110">
        <Layers size={32} strokeWidth={1.5} />
      </div>
      <h3 className="font-bold text-slate-800 text-sm mb-1">{product.name}</h3>
      <p className="text-xs text-slate-400 mb-3">{product.category}</p>
      <div className="mt-auto pt-2">
        <p className="text-lg font-black text-primary">
          {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
      
      {product.stock <= 0 && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Sem estoque</span>
        </div>
      )}
    </div>
  );
}

function CartItemView({ item, onUpdateQty, onRemove }: { item: CartItem, onUpdateQty: (delta: number) => void, onRemove: () => void, key?: any }) {
  return (
    <div className="bg-white border border-border p-3 rounded-xl flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-primary font-bold text-sm shrink-0">
        {item.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{item.name}</h4>
          <span className="text-sm font-black text-primary">
            {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400 font-medium">un. {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onUpdateQty(-1); }} className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
              <Minus size={14} />
            </button>
            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateQty(1); }} 
              disabled={item.quantity >= item.stock}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors disabled:opacity-30"
            >
              <Plus size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="ml-2 p-1 text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const CartListItem = CartItemView;

function StatCard({ icon, label, value, color, highlight }: { icon: ReactNode, label: string, value: string, color: 'blue' | 'emerald' | 'amber', highlight?: boolean }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className={`p-6 bg-white rounded-2xl border ${highlight ? 'border-amber-200 bg-amber-50/30' : 'border-border'} flex items-center gap-6 shadow-sm`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function PaymentOption({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all
        ${active 
          ? 'border-primary bg-primary/5 text-primary scale-105 shadow-xl shadow-primary/5' 
          : 'border-slate-100 hover:border-slate-200 text-slate-400 hover:text-slate-600'}
      `}
    >
      {icon}
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}