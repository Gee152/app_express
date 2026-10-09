import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PromoBannerConfig, PromoSlide, Produto } from '../../types';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Flame, Tag } from 'lucide-react';
import { getContrastText } from '../../utils/colors';

interface PromoSliderBannerProps {
  promoBanner: PromoBannerConfig;
  primaryColor: string;
  produtos: Produto[];
  destaquesList: Produto[];
  onSelectProduct: (product: Produto) => void;
  isDarkMode?: boolean;
}

export const PromoSliderBanner: React.FC<PromoSliderBannerProps> = ({
  promoBanner,
  primaryColor,
  produtos,
  destaquesList,
  onSelectProduct,
  isDarkMode,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Compila slides: usa lista de slides se configurada (até 5 ofertas) ou fallback para os campos base
  const slides = useMemo<PromoSlide[]>(() => {
    if (promoBanner.slides && promoBanner.slides.length > 0) {
      return promoBanner.slides;
    }

    return [
      {
        id: 'main-promo',
        tag: promoBanner.tag || 'OFERTA DO DIA',
        titulo: promoBanner.titulo || 'Combo Especial da Casa',
        subtitulo: promoBanner.subtitulo || 'Artesanal + Acompanhamento Especial',
        descricao:
          promoBanner.descricao ||
          'Aproveite a combinação perfeita com ingredientes frescos e receita exclusiva com desconto especial por tempo limitado.',
        badgeDesconto: promoBanner.badgeDesconto || '20% OFF',
        textoBotao: promoBanner.textoBotao || 'Aproveitar Oferta',
        imagem: promoBanner.imagem || (destaquesList[0]?.imagem ?? undefined),
        linkProdutoId: promoBanner.linkProdutoId || (destaquesList[0]?.id ?? undefined),
      },
    ];
  }, [promoBanner, destaquesList]);

  const totalSlides = slides.length;
  const intervalTime = (promoBanner.intervaloSegundos || 5) * 1000;

  // Auto-play timer
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused, intervalTime]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (diff > minSwipeDistance) {
      handleNext();
    } else if (diff < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleSlideClick = (slide: PromoSlide) => {
    if (slide.linkProdutoId) {
      const found = produtos.find((p) => String(p.id) === String(slide.linkProdutoId));
      if (found) {
        onSelectProduct(found);
        return;
      }
    }
    if (destaquesList[0]) {
      onSelectProduct(destaquesList[0]);
    }
  };

  const activeSlide = slides[currentIndex] || slides[0];

  return (
    <div
      className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-white/10 group select-none transition-all"
      style={{
        minHeight: '190px',
        backgroundColor: '#090d16',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Slides Container */}
      <div className="relative w-full h-52 sm:h-64 md:h-80 lg:h-88 overflow-hidden">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image filling full parent container (3:1 Widescreen) */}
              {slide.imagem ? (
                <img
                  src={slide.imagem}
                  alt={slide.titulo}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}40 0%, #0f172a 100%)`,
                  }}
                />
              )}

              {/* Dynamic Contrast Gradient Overlays (Widescreen Hero Readability) */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent sm:bg-gradient-to-r sm:from-slate-950/95 sm:via-slate-950/70 sm:to-transparent" />
              <div className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px]" />

              {/* Slide Content */}
              <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-between z-20">
                {/* Top Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {slide.tag && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-md text-white border border-white/20"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Sparkles className="w-3 h-3 fill-current text-amber-300" />
                      <span>{slide.tag}</span>
                    </span>
                  )}

                  {slide.badgeDesconto && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wide bg-amber-400 text-slate-950 shadow-md animate-pulse">
                      <Flame className="w-3 h-3 fill-current text-amber-900" />
                      <span>{slide.badgeDesconto}</span>
                    </span>
                  )}
                </div>

                {/* Center / Bottom Info */}
                <div className="space-y-1.5 sm:space-y-2 max-w-xl">
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                    {slide.titulo}
                    {slide.subtitulo && (
                      <span className="block text-xs sm:text-sm md:text-base font-medium text-slate-200 mt-0.5 opacity-90">
                        {slide.subtitulo}
                      </span>
                    )}
                  </h3>

                  {slide.descricao && (
                    <p className="text-slate-300 text-[11px] sm:text-xs md:text-sm line-clamp-2 leading-relaxed max-w-lg hidden xs:block">
                      {slide.descricao}
                    </p>
                  )}

                  {/* CTA Button */}
                  <div className="pt-2 sm:pt-3">
                    <button
                      type="button"
                      onClick={() => handleSlideClick(slide)}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-xl transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2 border hover:brightness-110"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.45)' : primaryColor,
                        color: isDarkMode ? '#FFFFFF' : getContrastText(primaryColor),
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.30)' : 'rgba(255, 255, 255, 0.25)',
                      }}
                    >
                      <span className="font-extrabold" style={{ color: isDarkMode ? '#FFFFFF' : getContrastText(primaryColor) }}>
                        {slide.textoBotao || 'Aproveitar Oferta'}
                      </span>
                      <ArrowRight
                        className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
                        style={{ color: isDarkMode ? '#FFFFFF' : getContrastText(primaryColor) }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (visible on hover / multi-slides) */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Slide Anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-lg active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Próximo Slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-lg active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination Indicators (Dots / Pills) */}
          <div className="absolute bottom-3 right-4 z-30 flex items-center gap-1.5 bg-slate-950/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Ir para slide ${dotIdx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  dotIdx === currentIndex
                    ? 'w-5 h-1.5 bg-white shadow-xs'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
