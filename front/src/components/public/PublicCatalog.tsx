import React, { useState, useEffect } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { PromoSliderBanner } from './PromoSliderBanner';
import {
  Search,
  ShoppingBag,
  MapPin,
  Clock,
  Instagram,
  Star,
  ArrowLeft,
  Store,
  Info,
  Home,
  Tag,
  Heart,
  SlidersHorizontal,
  Flame,
  Plus,
  Wifi,
  Battery,
  Sparkles,
  Globe,
  ExternalLink,
  Navigation,
  Phone,
  Moon,
  Sun,
} from 'lucide-react';
import { Produto, TemaCores } from '../../types';
import { getContrastText, darkenColor } from '../../utils/colors';
import { getNicheDefaultHeadline } from '../../utils/nichePrompts';

export const PublicCatalog: React.FC = () => {
  const {
    empresa,
    categorias,
    produtos,
    config,
    cart,
    addToCart,
    setActiveView,
    isOnboarded,
    isCustomerView,
    nichoId,
    isDarkMode,
    toggleDarkMode,
    trackCliqueLinkExterno,
  } = useCatalog();

  const [activeCategory, setActiveCategory] = useState<number | string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyDestaques, setOnlyDestaques] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'promos' | 'pedidos' | 'favoritos'>('home');

  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);

  useEffect(() => {
    if (showStatusTooltip) {
      const timer = setTimeout(() => setShowStatusTooltip(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showStatusTooltip]);

  const cores = config.tema.cores;
  const isDarkActive = isDarkMode;

  // Base background da loja original
  const origBg = cores.background || '#F5F7FB';
  const origSurface = cores.surface || '#FFFFFF';
  const origPrimary = cores.primary || '#4F3BFF';
  const origSecondary = cores.secondary || '#4F3BFF';

  // Na vitrine da loja: escurece 40% mantendo rigorosamente o tom e a saturação originais
  const background = isDarkActive ? darkenColor(origBg, 0.40) : origBg;
  const surface = isDarkActive ? darkenColor(origBg, 0.52) : origSurface;
  const textColor = isDarkActive ? '#FFFFFF' : (cores.text || '#212529');
  const textSecondary = isDarkActive ? '#FFFFFF' : (cores.textSecondary || '#6C757D');
  const borderColor = isDarkActive ? 'rgba(255, 255, 255, 0.40)' : (cores.border || '#E0E0E0');
  const accent = isDarkActive ? darkenColor(origBg, 0.30) : (cores.accent || '#EDF2F7');
  const primary = origPrimary;
  const secondary = origSecondary;
  const tertiary = cores.tertiary || '#10B981';

  const effectiveCores: TemaCores = {
    primary,
    secondary,
    tertiary,
    background,
    surface,
    text: textColor,
    textSecondary,
    border: borderColor,
    accent,
  };

  const primaryContrast = getContrastText(primary);

  // Filter products
  const filteredProducts = produtos.filter((p) => {
    if (p.status === false) return false;

    if (activeCategory !== 'todos' && p.categoria != activeCategory) {
      return false;
    }

    if (onlyDestaques && !p.destaque) {
      return false;
    }

    if (activeTab === 'promos' && !p.destaque) {
      return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = p.nome.toLowerCase().includes(term);
      const matchDesc = (p.descricao || '').toLowerCase().includes(term);
      return matchName || matchDesc;
    }

    return true;
  });

  const destaquesList = produtos.filter((p) => p.destaque && p.status !== false);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantidade, 0);
  const cartTotalPrice = cart.reduce(
    (acc, item) => acc + (item.produto.preco + (item.acrescimo || 0)) * item.quantidade,
    0
  );

  // Informações de Localização & Espaço Físico formatadas
  const enderecoCompleto = [
    empresa.endereco,
    empresa.numero,
    empresa.bairro,
    empresa.cidade,
  ]
    .filter(Boolean)
    .join(', ');

  const mapsDirectUrl =
    empresa.googleMapsUrl ||
    (enderecoCompleto
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`
      : undefined);

  const routeUrl = enderecoCompleto
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoCompleto)}`
    : mapsDirectUrl;

  const wazeUrl = enderecoCompleto
    ? `https://waze.com/ul?q=${encodeURIComponent(enderecoCompleto)}`
    : undefined;

  const mapEmbedSrc = enderecoCompleto
    ? `https://maps.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : undefined;

  // Layout Content Inner
  const catalogContent = (
    <div className="space-y-6 md:space-y-8 pb-28 md:pb-16 max-w-7xl mx-auto">
      {/* Immersive Store Hero Header Banner (Incorporating Logo, Identity & Controls) */}
      <div
        className="relative w-full rounded-3xl overflow-hidden shadow-lg border min-h-[220px] sm:min-h-[260px] md:min-h-[290px] flex flex-col justify-between p-4 sm:p-6 md:p-8 transition-all"
        style={{
          borderColor: `${primary}30`,
          backgroundColor: surface,
        }}
      >
        {/* Background Image / Gradient Layer */}
        {empresa.banner ? (
          <>
            <img
              src={empresa.banner}
              alt={empresa.nome || 'Ambiente da Loja'}
              loading="eager"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Cinematic Gradient Overlay for Maximum Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/40" />
          </>
        ) : (
          <div
            className="absolute inset-0 opacity-95"
            style={{
              background: `linear-gradient(135deg, ${primary}dd 0%, #1e1b4b 60%, #0f172a 100%)`,
            }}
          />
        )}

        {/* Top Controls Row inside the Hero Banner */}
        <div className="relative z-10 flex items-center justify-between gap-1.5 sm:gap-3 w-full">
          {/* Status Badge with Mobile Tooltip */}
          <div className="relative flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusTooltip((prev) => !prev);
              }}
              onMouseEnter={() => setShowStatusTooltip(true)}
              onMouseLeave={() => setShowStatusTooltip(false)}
              className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              title="Status da Loja: Aberto para Pedidos"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="hidden sm:inline">Aberto para Pedidos</span>
              <span className="sm:hidden font-bold">Aberto</span>
            </button>

            {/* Mobile Status Tooltip */}
            {showStatusTooltip && (
              <div
                className="sm:hidden absolute top-full left-0 mt-2 z-50 px-3 py-2 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-white text-[11px] font-semibold shadow-2xl backdrop-blur-md whitespace-nowrap animate-in fade-in slide-in-from-top-1 duration-150 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <div>
                  <p className="font-bold text-emerald-300">Aberto para Pedidos</p>
                  <p className="text-[10px] text-slate-300 font-normal">Recebendo novos pedidos online agora</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Voltar ao Admin, Modo Escuro & Seu Pedido */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={toggleDarkMode}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl font-bold text-xs bg-white/90 hover:bg-white text-slate-900 border border-white/40 shadow-sm backdrop-blur-md transition-all cursor-pointer active:scale-95 flex items-center justify-center flex-shrink-0"
              title={isDarkActive ? 'Mudar para Modo Claro' : 'Ativar Modo Escuro'}
            >
              {isDarkActive ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {!isCustomerView && (
              <button
                onClick={() => setActiveView('admin')}
                className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl font-extrabold text-[11px] sm:text-xs bg-white/90 hover:bg-white text-indigo-700 border border-white/40 shadow-sm backdrop-blur-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
                title="Voltar para o Painel Admin"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span className="hidden sm:inline">Voltar ao Admin</span>
                <span className="sm:hidden font-bold">Admin</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer hover:brightness-110 border border-white/20 backdrop-blur-md flex items-center gap-1.5 sm:gap-2 flex-shrink-0 whitespace-nowrap"
              style={{ backgroundColor: primary, color: primaryContrast }}
            >
              <ShoppingBag className="w-4 h-4 flex-shrink-0" />
              <span>Pedido ({cartTotalItems})</span>
              {cartTotalPrice > 0 && (
                <span
                  className="hidden md:inline px-1.5 py-0.5 rounded-md text-xs font-black"
                  style={{ backgroundColor: `${primaryContrast}25`, color: primaryContrast }}
                >
                  R$ {cartTotalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Store Brand & Information Row inside the Hero Banner */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-3.5 sm:gap-5 mt-6 sm:mt-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            {empresa.logo ? (
              <img
                src={empresa.logo}
                alt={empresa.nome}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-white/80 shadow-2xl backdrop-blur-md bg-slate-900/50"
              />
            ) : (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl border-2 border-white/80 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-2xl backdrop-blur-md"
                style={{ backgroundColor: primary, color: primaryContrast }}
              >
                {empresa.nome?.charAt(0) || 'L'}
              </div>
            )}
          </div>

          {/* Text Information */}
          <div className="min-w-0 space-y-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <span>Olá, Bem-vindo!</span> 👋
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md truncate">
              {empresa.nome || 'Minha Loja'}
            </h1>
            {enderecoCompleto && (
              <div className="pt-0.5">
                <a
                  href={mapsDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold transition-all border border-white/30 shadow-xs cursor-pointer active:scale-95 group"
                  title="Abrir localização no Google Maps"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate max-w-[260px] sm:max-w-md">{enderecoCompleto}</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Headline */}
      {(() => {
        const defaultHeadline = getNicheDefaultHeadline(nichoId);
        const titulo = empresa.headlineTitulo || defaultHeadline.titulo;
        const subtitulo = empresa.headlineSubtitulo || defaultHeadline.subtitulo;

        return (
          <div className="space-y-1">
            <h2 className="text-2xl md:text-4xl font-black leading-tight" style={{ color: textColor }}>
              {titulo}
            </h2>
            {subtitulo && (
              <p
                className="text-xs md:text-sm font-medium transition-all"
                style={{ color: textSecondary }}
              >
                {subtitulo}
              </p>
            )}
          </div>
        );
      })()}

      {/* Search Bar & Desktop Layout Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3.5 md:left-4 top-3.5 md:top-4 text-slate-400 dark:text-slate-200" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="O que você deseja pedir hoje?"
            className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 rounded-2xl border text-xs md:text-sm font-medium placeholder-slate-400 dark:placeholder-slate-300 outline-none transition-all shadow-2xs focus:border-white/80"
            style={{
              backgroundColor: surface,
              color: textColor,
              borderColor: isDarkActive ? 'rgba(255, 255, 255, 0.45)' : borderColor,
            }}
          />
        </div>

        <button
          onClick={() => setOnlyDestaques(!onlyDestaques)}
          className={`px-4 py-3 md:py-3.5 rounded-2xl border transition-all cursor-pointer flex-shrink-0 flex items-center gap-2 text-xs md:text-sm ${
            onlyDestaques ? 'font-bold shadow-md' : ''
          }`}
          style={
            onlyDestaques
              ? { backgroundColor: primary, color: primaryContrast, borderColor: primary }
              : { backgroundColor: surface, color: textColor, borderColor: isDarkActive ? 'rgba(255, 255, 255, 0.40)' : borderColor }
          }
          title="Filtrar Destaques"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden md:inline font-bold">Apenas Destaques</span>
        </button>
      </div>

      {/* Category Pills Slider / Desktop Wrap */}
      <div className="flex items-center gap-2 md:gap-3 overflow-x-auto md:flex-wrap pb-1 no-scrollbar -mx-2 px-2 md:mx-0 md:px-0">
        <button
          onClick={() => setActiveCategory('todos')}
          className="px-4 py-2.5 md:px-5 md:py-3 rounded-2xl text-xs md:text-sm font-black transition-all whitespace-nowrap cursor-pointer border shadow-2xs"
          style={
            activeCategory === 'todos'
              ? { backgroundColor: primary, color: primaryContrast, borderColor: primary }
              : { backgroundColor: surface, color: textColor, borderColor: isDarkActive ? 'rgba(255, 255, 255, 0.40)' : borderColor }
          }
        >
          🍔 Todos
        </button>

        {categorias.map((cat) => {
          const isSel = activeCategory == cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-4 py-2.5 md:px-5 md:py-3 rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border shadow-2xs"
              style={
                isSel
                  ? { backgroundColor: primary, color: primaryContrast, borderColor: primary }
                  : { backgroundColor: surface, color: textColor, borderColor: isDarkActive ? 'rgba(255, 255, 255, 0.40)' : borderColor }
              }
            >
              <span>{cat.icone || '📂'}</span> {cat.nome}
            </button>
          );
        })}
      </div>

      {/* Promo Slider Banner (Widescreen Hero, Mobile & Desktop Responsive) */}
      {empresa.promoBanner?.ativo !== false && (
        <PromoSliderBanner
          promoBanner={empresa.promoBanner || { ativo: true }}
          primaryColor={primary}
          produtos={produtos}
          destaquesList={destaquesList}
          onSelectProduct={(p) => setSelectedProduct(p)}
          isDarkMode={isDarkActive}
        />
      )}

      {/* Popular Items Section */}
      {destaquesList.length > 0 && activeCategory === 'todos' && !searchTerm && (
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-xl font-black flex items-center gap-2" style={{ color: textColor }}>
              <Flame className="w-4 h-4 md:w-5 md:h-5 fill-current" style={{ color: primary }} />
              <span>Mais Pedidos & Populares</span>
            </h3>
            <button
              onClick={() => setOnlyDestaques(!onlyDestaques)}
              className="text-xs md:text-sm font-bold hover:underline"
              style={{ color: primary }}
            >
              Ver todos ({destaquesList.length})
            </button>
          </div>

          <div className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory gap-3.5 pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:pt-0 sm:grid sm:grid-cols-3 md:grid-cols-4 sm:gap-4 md:gap-5 sm:overflow-visible sm:snap-none">
            {destaquesList.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="w-[68vw] min-w-[220px] max-w-[270px] sm:w-auto sm:min-w-0 sm:max-w-none flex-shrink-0 sm:flex-shrink snap-start rounded-2xl p-3.5 sm:p-4 border flex flex-col justify-between cursor-pointer space-y-3 group transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ backgroundColor: surface, borderColor }}
              >
                <div className="w-full h-40 sm:h-36 md:h-44 rounded-xl overflow-hidden relative" style={{ backgroundColor: `${borderColor}60` }}>
                  {p.imagem ? (
                    <img src={p.thumbnail || p.imagem} alt={p.nome} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Sem Foto</div>
                  )}
                  <span
                    className="absolute top-2 left-2 text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-md uppercase shadow-xs"
                    style={{ backgroundColor: primary, color: primaryContrast }}
                  >
                    Popular
                  </span>
                  {p.linkExterno && (
                    <span className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs bg-slate-900/85 backdrop-blur-xs text-white border border-white/20">
                      {p.linkExterno.toLowerCase().includes('shopee') ? 'Shopee 🛍️' : p.linkExterno.toLowerCase().includes('mercadolivre') || p.linkExterno.toLowerCase().includes('mercado livre') ? 'ML 📦' : 'Online 🔗'}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-sm md:text-base line-clamp-1 leading-snug" style={{ color: textColor }}>{p.nome}</h4>
                  {p.descricao && (
                    <p className="text-[11px] sm:text-xs line-clamp-1 font-medium" style={{ color: textSecondary }}>
                      {p.descricao}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1.5">
                    <span className="font-black text-sm md:text-base" style={{ color: primary }}>
                      R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p, 1);
                      }}
                      className="w-8 h-8 md:w-8 md:h-8 rounded-xl font-black flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-xs"
                      style={{ backgroundColor: primary, color: primaryContrast }}
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content Renderer */}
      {activeTab === 'pedidos' ? (
        /* Store Info & Contact Tab */
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-3xl p-6 md:p-8 border space-y-6" style={{ backgroundColor: surface, borderColor }}>
            <div className="flex items-center gap-4">
              {empresa.logo ? (
                <img src={empresa.logo} alt={empresa.nome} className="w-16 h-16 rounded-2xl object-cover border" style={{ borderColor: `${primary}50` }} />
              ) : (
                <div className="w-16 h-16 rounded-2xl font-black flex items-center justify-center text-2xl" style={{ backgroundColor: primary, color: primaryContrast }}>
                  {empresa.nome?.charAt(0) || 'L'}
                </div>
              )}
              <div>
                <h3 className="text-xl font-black" style={{ color: textColor }}>{empresa.nome}</h3>
                <p className="text-xs md:text-sm font-bold" style={{ color: primary }}>{empresa.tipo_cozinha || 'Gastronomia & Atendimento'}</p>
              </div>
            </div>

            <p className="text-xs md:text-sm leading-relaxed" style={{ color: textSecondary }}>
              {empresa.especialidades || 'Entregando produtos e serviços com excelência e qualidade garantida.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs md:text-sm font-semibold">
              {(empresa.horarioFuncionamento || empresa.horario_funcionamento) && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl border" style={{ backgroundColor: `${primary}08`, borderColor: `${primary}25`, color: textColor }}>
                  <Clock className="w-5 h-5 flex-shrink-0" style={{ color: primary }} />
                  <div>
                    <span className="block text-[10px] font-bold uppercase" style={{ color: textSecondary }}>Horário de Funcionamento</span>
                    <span>{empresa.horarioFuncionamento || empresa.horario_funcionamento}</span>
                  </div>
                </div>
              )}

              {empresa.whatsapp && (
                <a
                  href={`https://wa.me/${empresa.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-2xl border hover:opacity-90 transition-all cursor-pointer"
                  style={{ backgroundColor: `${primary}08`, borderColor: `${primary}25`, color: textColor }}
                >
                  <Phone className="w-5 h-5 flex-shrink-0" style={{ color: primary }} />
                  <div>
                    <span className="block text-[10px] font-bold uppercase" style={{ color: textSecondary }}>WhatsApp</span>
                    <span>{empresa.whatsapp}</span>
                  </div>
                </a>
              )}

              {empresa.instagram && (
                <a
                  href={empresa.instagram.startsWith('http') ? empresa.instagram : `https://instagram.com/${empresa.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-2xl border hover:opacity-90 transition-all cursor-pointer"
                  style={{ backgroundColor: `${primary}08`, borderColor: `${primary}25`, color: textColor }}
                >
                  <Instagram className="w-5 h-5 flex-shrink-0" style={{ color: primary }} />
                  <div>
                    <span className="block text-[10px] font-bold uppercase" style={{ color: textSecondary }}>Instagram</span>
                    <span>{empresa.instagram}</span>
                  </div>
                </a>
              )}
            </div>

            {/* Espaço Físico & Integração com Google Maps */}
            {(() => {
              const fullAddress = [
                empresa.endereco,
                empresa.numero,
                empresa.bairro,
                empresa.cidade,
              ]
                .filter(Boolean)
                .join(', ');

              if (!fullAddress && !empresa.googleMapsUrl) return null;

              const mapsDirectUrl =
                empresa.googleMapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
              const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(fullAddress)}`;
              const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

              return (
                <div className="pt-4 border-t space-y-4" style={{ borderColor }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-black flex items-center gap-2" style={{ color: textColor }}>
                        <MapPin className="w-5 h-5" style={{ color: primary }} />
                        <span>Espaço Físico & Localização</span>
                      </h4>
                      <p className="text-xs" style={{ color: textSecondary }}>
                        Venha nos visitar em nosso espaço físico ou trace sua rota pelo mapa.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={mapsDirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer hover:opacity-90"
                        style={{ backgroundColor: primary, color: primaryContrast }}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Abrir no Google Maps</span>
                      </a>
                      <a
                        href={wazeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      >
                        <span>Waze</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Informações detalhadas do endereço */}
                  <div className="p-4 rounded-2xl border space-y-2 text-xs" style={{ backgroundColor: `${primary}05`, borderColor: `${primary}20` }}>
                    <div className="flex items-start gap-2">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 min-w-[70px]">Endereço:</span>
                      <span className="font-extrabold text-sm" style={{ color: textColor }}>
                        {fullAddress || empresa.endereco}
                      </span>
                    </div>

                    {empresa.pontoReferencia && (
                      <div className="flex items-start gap-2">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 min-w-[70px]">Referência:</span>
                        <span style={{ color: textSecondary }}>{empresa.pontoReferencia}</span>
                      </div>
                    )}
                  </div>

                  {/* Google Maps Iframe Embed Interativo */}
                  <div className="w-full h-56 md:h-72 rounded-2xl overflow-hidden border shadow-inner relative" style={{ borderColor }}>
                    <iframe
                      title="Google Maps Localização"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={mapEmbedSrc}
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : activeTab === 'favoritos' ? (
        /* Favorites / Highlights Tab */
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-xl font-black flex items-center gap-2" style={{ color: textColor }}>
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <span>Itens Recomendados & Especiais</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {destaquesList.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="rounded-2xl p-3.5 border flex items-center gap-3 cursor-pointer transition-all hover:border-amber-500/50"
                style={{ backgroundColor: surface, borderColor }}
              >
                {p.imagem ? (
                  <img src={p.thumbnail || p.imagem} alt={p.nome} loading="lazy" decoding="async" className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border" style={{ borderColor }} />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-200 flex items-center justify-center text-[10px] text-slate-400">Sem Foto</div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-black text-xs md:text-sm truncate" style={{ color: textColor }}>{p.nome}</h4>
                  {p.descricao && (
                    <p
                      className="text-[11px] line-clamp-2 leading-tight transition-all font-medium"
                      style={{ color: textSecondary }}
                    >
                      {p.descricao}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-black text-xs md:text-sm" style={{ color: primary }}>R$ {Number(p.preco).toFixed(2).replace('.', ',')}</span>
                    {p.linkExternoAtivo && p.linkExterno ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          trackCliqueLinkExterno(p.id);
                          window.open(p.linkExterno, '_blank', 'noopener,noreferrer');
                        }}
                        className="px-2.5 py-1 rounded-lg font-black text-[11px] bg-amber-500 hover:bg-amber-400 text-white cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <span>{p.nomePlataformaExterna || 'Comprar'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); }}
                        className="px-3 py-1.5 rounded-lg font-black text-[11px] cursor-pointer hover:opacity-90"
                        style={{ backgroundColor: primary, color: primaryContrast }}
                      >
                        Pedir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Normal Catalog Main Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-xl font-black" style={{ color: textColor }}>
              Nosso Cardápio Completo
            </h3>
            <span className="text-xs font-bold" style={{ color: textSecondary }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item disponível' : 'itens disponíveis'}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed p-8 space-y-2" style={{ backgroundColor: surface, borderColor }}>
              <Store className="w-10 h-10 mx-auto text-slate-400" />
              <p className="font-bold text-sm" style={{ color: textColor }}>Nenhum produto encontrado nesta categoria.</p>
              <p className="text-xs" style={{ color: textSecondary }}>Tente buscar por outro nome ou selecione a categoria "Todos".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="rounded-2xl p-3.5 border flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg group"
                  style={{ backgroundColor: surface, borderColor }}
                >
                  <div className="w-full h-40 rounded-xl overflow-hidden relative mb-3" style={{ backgroundColor: `${borderColor}60` }}>
                    {p.imagem ? (
                      <img
                        src={p.thumbnail || p.imagem}
                        alt={p.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        Sem Foto
                      </div>
                    )}

                    {p.destaque && (
                      <span
                        className="absolute top-2.5 left-2.5 text-[10px] font-black px-2 py-0.5 rounded-md uppercase shadow-xs"
                        style={{ backgroundColor: primary, color: primaryContrast }}
                      >
                        Destaque
                      </span>
                    )}

                    {p.linkExternoAtivo && p.linkExterno && (
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs bg-amber-500/95 backdrop-blur-xs text-white border border-white/20 flex items-center gap-1">
                        <span>{p.nomePlataformaExterna || 'Loja Externa'}</span>
                        <ExternalLink className="w-2.5 h-2.5 stroke-[2.5]" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-black text-sm truncate" style={{ color: textColor }}>{p.nome}</h4>
                        <span className="text-[10px] font-bold flex items-center gap-0.5 flex-shrink-0" style={{ color: primary }}>
                          <Star className="w-3 h-3 fill-current" /> 4.9
                        </span>
                      </div>

                      {p.descricao && (
                        <p
                          className="text-xs line-clamp-2 leading-tight transition-all font-medium"
                          style={{ color: textSecondary }}
                        >
                          {p.descricao}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor }}>
                      <span className="font-black text-sm" style={{ color: primary }}>
                        R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                      </span>
                      {p.linkExternoAtivo && p.linkExterno ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            trackCliqueLinkExterno(p.id);
                            window.open(p.linkExterno, '_blank', 'noopener,noreferrer');
                          }}
                          className="px-3 py-1.5 rounded-xl font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-xs inline-flex items-center gap-1.5 bg-amber-500 text-white cursor-pointer"
                          title={`Ir para ${p.nomePlataformaExterna || 'Loja Externa'}`}
                        >
                          <span>{p.nomePlataformaExterna ? `Ir p/ ${p.nomePlataformaExterna}` : 'Comprar'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(p);
                          }}
                          className="px-3.5 py-1.5 rounded-xl font-black text-xs hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                          style={{ backgroundColor: primary, color: primaryContrast }}
                        >
                          + Pedir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bloco de Localização & Espaço Físico na Vitrine */}
      {(empresa.temEspacoFisico ?? !!empresa.endereco) && (enderecoCompleto || empresa.googleMapsUrl) && (
        <div
          className="rounded-3xl p-6 md:p-8 border space-y-4 shadow-xs transition-all animate-in fade-in duration-200"
          style={{ backgroundColor: surface, borderColor }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${primary}15`, color: primary }}>
                  Atendimento Presencial
                </span>
                {(empresa.horarioFuncionamento || empresa.horario_funcionamento) && (
                  <span className="text-[11px] font-semibold flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{empresa.horarioFuncionamento || empresa.horario_funcionamento}</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg md:text-xl font-black flex items-center gap-2 mt-1" style={{ color: textColor }}>
                <MapPin className="w-5 h-5" style={{ color: primary }} />
                <span>Nosso Espaço Físico & Localização</span>
              </h3>
              <p className="text-xs md:text-sm font-medium" style={{ color: textSecondary }}>
                Visite nosso estabelecimento ou trace sua rota pelo GPS.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {mapsDirectUrl && (
                <a
                  href={mapsDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: primary, color: primaryContrast }}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Abrir no Google Maps</span>
                </a>
              )}
              {wazeUrl && (
                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Waze</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Endereço Detalhado */}
          <div className="p-4 rounded-2xl border space-y-1.5 text-xs" style={{ backgroundColor: `${primary}05`, borderColor: `${primary}20` }}>
            <div className="flex items-start gap-2">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 min-w-[75px]">Endereço:</span>
              <span className="font-extrabold text-sm" style={{ color: textColor }}>
                {enderecoCompleto || empresa.endereco}
              </span>
            </div>

            {empresa.pontoReferencia && (
              <div className="flex items-start gap-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 min-w-[75px]">Referência:</span>
                <span style={{ color: textSecondary }}>{empresa.pontoReferencia}</span>
              </div>
            )}
          </div>

          {/* Mapa Interativo Embed */}
          {mapEmbedSrc && (
            <div className="w-full h-56 md:h-72 rounded-2xl overflow-hidden border shadow-inner relative" style={{ borderColor }}>
              <iframe
                title="Localização no Google Maps"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={mapEmbedSrc}
                className="w-full h-full border-0"
              />
            </div>
          )}
        </div>
      )}

    </div>
  );

  return (
    <div
      className="min-h-screen transition-colors duration-300 relative"
      style={{
        backgroundColor: background,
        color: textColor,
      }}
    >
      {/* Top Floating Admin Bar */}
      {!isCustomerView && (
        <div className="bg-slate-900 text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-md border-b border-slate-800 z-30 relative">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200 hidden sm:inline">Visualizando Vitrine Pública</span>
            <span className="font-bold text-slate-200 sm:hidden">Vitrine</span>
          </div>

          <button
            onClick={() => setActiveView('admin')}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 text-xs shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Voltar ao Painel Admin</span>
          </button>
        </div>
      )}

      {/* Native Responsive View for Mobile, Tablet & Desktop */}
      <div className="w-full px-4 md:px-8 pt-4 md:pt-6">
        {catalogContent}

          {/* Floating Cart Button for Desktop */}
          {cartTotalItems > 0 && (
            <div className="hidden md:block fixed bottom-6 right-8 z-40 animate-bounce">
              <button
                onClick={() => setIsCartOpen(true)}
                className="py-3.5 px-6 rounded-2xl font-black text-sm shadow-2xl flex items-center gap-3 transition-transform active:scale-95 cursor-pointer border-2"
                style={{
                  backgroundColor: primary,
                  color: primaryContrast,
                  borderColor: primaryContrast === '#FFFFFF' ? '#0F172A' : '#FFFFFF',
                }}
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                <span>Ver Pedido ({cartTotalItems})</span>
                <span
                  className="px-2 py-0.5 rounded-lg text-xs font-black"
                  style={{
                    backgroundColor: primaryContrast === '#FFFFFF' ? '#0F172A' : '#FFFFFF',
                    color: primary,
                  }}
                >
                  R$ {cartTotalPrice.toFixed(2).replace('.', ',')}
                </span>
              </button>
            </div>
          )}

          {/* Mobile Bottom Navigation Bar (Hidden on desktop md:hidden) */}
          <div
            className="md:hidden fixed bottom-0 inset-x-0 backdrop-blur-md border-t p-3 flex items-center justify-around z-30 shadow-lg"
            style={{ backgroundColor: surface, borderColor }}
          >
            <button
              onClick={() => setActiveTab('home')}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold cursor-pointer transition-all"
              style={{ color: activeTab === 'home' ? primary : textSecondary }}
            >
              <Home className="w-5 h-5" />
              <span>Início</span>
            </button>

            <button
              onClick={() => setActiveTab('promos')}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold cursor-pointer transition-all"
              style={{ color: activeTab === 'promos' ? primary : textSecondary }}
            >
              <Tag className="w-5 h-5" />
              <span>Ofertas</span>
            </button>

            {/* Floating Center Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-12 h-12 rounded-full font-black flex items-center justify-center shadow-lg -mt-6 border-4 transition-transform active:scale-95"
              style={{
                backgroundColor: primary,
                color: primaryContrast,
                borderColor: surface,
              }}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                  {cartTotalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pedidos')}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold cursor-pointer transition-all"
              style={{ color: activeTab === 'pedidos' ? primary : textSecondary }}
            >
              <Store className="w-5 h-5" />
              <span>Sobre</span>
            </button>

            <button
              onClick={() => setActiveTab('favoritos')}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold cursor-pointer transition-all"
              style={{ color: activeTab === 'favoritos' ? primary : textSecondary }}
            >
              <Heart className="w-5 h-5" />
              <span>Favoritos</span>
            </button>
          </div>
        </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          produto={selectedProduct}
          primaryColor={primary}
          themeCores={effectiveCores}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && <CartDrawer onClose={() => setIsCartOpen(false)} />}
    </div>
  );
};

