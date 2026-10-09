import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { NICHOS } from '../../data/nichos';
import { Check } from 'lucide-react';

export const StepNicho: React.FC = () => {
  const { nichoId, setNicho } = useCatalog();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#212529] dark:text-[#FFFFFF]">Passo 1: Qual é o seu nicho de negócio?</h2>
        <p className="text-sm md:text-base text-[#6C757D] dark:text-[#B0BEC5]">
          Sua escolha vai personalizar os campos do formulário, os dados e os temas visuais recomendados.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {NICHOS.map((nicho) => {
          const isSelected = nichoId === nicho.id;
          return (
            <div
              key={nicho.id}
              onClick={() => setNicho(nicho.id)}
              className={`relative cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#4F3BFF] dark:border-[#7C4DFF] bg-indigo-50/60 dark:bg-[#7C4DFF]/15 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] hover:border-[#4F3BFF]/50 hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="text-4xl mb-3">{nicho.icone}</div>
                <h3 className="font-bold text-lg text-[#212529] dark:text-[#FFFFFF]">{nicho.nome}</h3>
                <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5] mt-1.5 leading-relaxed">{nicho.descricao}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E0E0E0] dark:border-[#333333] flex flex-wrap gap-1">
                {nicho.exemplos.map((ex) => (
                  <span
                    key={ex}
                    className="text-[11px] font-medium bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#6C757D] dark:text-[#B0BEC5] px-2 py-0.5 rounded-md"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
