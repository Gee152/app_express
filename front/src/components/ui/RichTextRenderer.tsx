import React from 'react';

interface RichTextRendererProps {
  content?: string;
  className?: string;
  primaryColor?: string;
}

/**
 * Renderizador de Texto Rico que interpreta marcações do Lexical,
 * Markdown (negrito, itálico, listas, cabeçalhos, emojis e padrões "Título: Detalhes")
 * para exibição elegante no catálogo e no modal de detalhes do produto.
 */
export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className = '',
  primaryColor,
}) => {
  if (!content || !content.trim()) return null;

  const lines = content.split(/\r?\n/);

  return (
    <div className={`space-y-2 text-xs leading-relaxed text-slate-300 ${className}`}>
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();

        // Linha vazia -> espaçamento
        if (!line) {
          return <div key={idx} className="h-1" />;
        }

        // Cabeçalhos de seção com emojis ou Markdown (ex: "🥟 Os 10 Sabores Principais (Bases)", "## Recheios")
        const isHeader =
          /^#{1,4}\s+/u.test(line) ||
          /^[^\w\s\d(]{1,4}\s+[A-Z0-9]/u.test(line) ||
          /^(os\s+\d+|itens\s+de\s+opções|sabores|adicionais|opções|ingredientes)/i.test(line);

        if (isHeader) {
          const cleanTitle = line.replace(/^#{1,4}\s+/, '');
          return (
            <div
              key={idx}
              className="pt-2 pb-0.5 font-extrabold text-sm text-white flex items-center gap-1.5 border-b border-slate-800/80"
              style={primaryColor ? { borderBottomColor: `${primaryColor}40` } : undefined}
            >
              <span>{cleanTitle}</span>
            </div>
          );
        }

        // Lista com marcadores (ex: "- Item", "• Item", "* Item")
        const isBullet = /^[-*•]\s+/.test(line);
        const isNumbered = /^\d+[.)]\s+/.test(line);

        const cleanBulletLine = line.replace(/^[-*•\d.)]+\s+/, '');

        // Formatação de linha (detecta "Nome: Descrição" ou "**Negrito**")
        const renderFormattedText = (text: string) => {
          // Se contém Markdown **negrito**
          if (text.includes('**')) {
            const parts = text.split(/(\*\*[^*]+\*\*)/g);
            return parts.map((p, pIdx) => {
              if (p.startsWith('**') && p.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-white">
                    {p.slice(2, -2)}
                  </strong>
                );
              }
              return p;
            });
          }

          // Se contém "Item: Descrição..." (ex: "Carne Clássica: Carne moída temperada...")
          if (text.includes(':') && !text.startsWith('http')) {
            const colonIndex = text.indexOf(':');
            const titlePart = text.substring(0, colonIndex).trim();
            const descPart = text.substring(colonIndex + 1).trim();

            if (titlePart.length > 0 && titlePart.length < 45) {
              return (
                <>
                  <strong className="font-bold text-white">{titlePart}:</strong>{' '}
                  <span className="text-slate-300">{descPart}</span>
                </>
              );
            }
          }

          return text;
        };

        if (isBullet || isNumbered) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span
                className="font-bold text-xs mt-0.5 select-none"
                style={{ color: primaryColor || '#818cf8' }}
              >
                {isNumbered ? line.match(/^\d+[.)]/)?.[0] : '•'}
              </span>
              <div className="flex-1 text-slate-300 leading-snug">
                {renderFormattedText(cleanBulletLine)}
              </div>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {renderFormattedText(line)}
          </p>
        );
      })}
    </div>
  );
};
