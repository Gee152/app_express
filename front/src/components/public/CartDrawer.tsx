import React, { useState } from 'react';
import { Select } from '../ui/Select';
import { useCatalog } from '../../context/CatalogContext';
import { X, Plus, Minus, Trash2, Send, CreditCard, MapPin, User, CheckCircle2 } from 'lucide-react';
import { getContrastText } from '../../utils/colors';

interface CartDrawerProps {
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onClose }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, empresa, config, registrarPedido, activeSlug } =
    useCatalog();

  const [clienteNome, setClienteNome] = useState('');
  const [opcaoEntrega, setOpcaoEntrega] = useState<'entrega' | 'retirada'>('entrega');
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [trocoPara, setTrocoPara] = useState('');
  const [observacoesGerais, setObservacoesGerais] = useState('');

  const primaryColor = config.tema.cores.primary || '#F59E0B';
  const primaryContrast = getContrastText(primaryColor);

  const totalGeral = cart.reduce(
    (acc, item) => acc + (item.produto.preco + (item.acrescimo || 0)) * item.quantidade,
    0
  );

  const handleSendWhatsApp = () => {
    const rawPhone = empresa.whatsapp || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

    if (!cleanPhone) {
      alert('O número de WhatsApp da empresa não está configurado.');
      return;
    }

    if (cart.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }

    let msg = `*NOVO PEDIDO - ${empresa.nome || 'Catálogo Digital'}*\n`;
    msg += `------------------------------------\n`;

    if (clienteNome.trim()) {
      msg += `👤 *Cliente:* ${clienteNome.trim()}\n`;
    }

    msg += `📍 *Tipo:* ${opcaoEntrega === 'entrega' ? 'Entrega no Endereço' : 'Retirada no Local'}\n`;
    if (opcaoEntrega === 'entrega' && enderecoEntrega.trim()) {
      msg += `🏠 *Endereço:* ${enderecoEntrega.trim()}\n`;
    }

    msg += `💳 *Forma de Pagamento:* ${formaPagamento}\n`;
    if (formaPagamento === 'Dinheiro' && trocoPara.trim()) {
      msg += `💵 *Troco para:* R$ ${trocoPara.trim()}\n`;
    }

    msg += `------------------------------------\n`;
    msg += `*ITENS DO PEDIDO:*\n\n`;

    cart.forEach((item, idx) => {
      const unit = item.produto.preco + (item.acrescimo || 0);
      const subtotal = unit * item.quantidade;
      msg += `*${item.quantidade}x ${item.produto.nome}* - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;

      if (item.opcoesDetalhe && item.opcoesDetalhe.length > 0) {
        item.opcoesDetalhe.forEach((g) => {
          const nomes = g.itens.map((i) => (i.preco > 0 ? `${i.nome} (+R$ ${i.preco.toFixed(2).replace('.', ',')})` : i.nome));
          msg += `   └ _${g.grupo}: ${nomes.join(', ')}_\n`;
        });
      }

      if (item.observacoes) {
        msg += `   └ _Obs: ${item.observacoes}_\n`;
      }
      msg += `\n`;
    });

    msg += `------------------------------------\n`;
    msg += `*TOTAL DO PEDIDO: R$ ${totalGeral.toFixed(2).replace('.', ',')}*\n`;

    if (observacoesGerais.trim()) {
      msg += `\n📝 *Observações do Pedido:* ${observacoesGerais.trim()}\n`;
    }

    msg += `\n_Pedido enviado através do Catálogo Express_`;

    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodedMsg}`;

    window.open(whatsappUrl, '_blank');

    // Rastro no sistema: grava o pedido localmente (além do envio via WhatsApp).
    if (activeSlug) {
      registrarPedido(activeSlug, {
        cliente: clienteNome.trim(),
        tipoEntrega: opcaoEntrega,
        endereco: enderecoEntrega.trim() || undefined,
        formaPagamento,
        trocoPara: trocoPara.trim() || undefined,
        observacoes: observacoesGerais.trim() || undefined,
        itens: cart.map((item) => {
          const unit = item.produto.preco + (item.acrescimo || 0);
          const opcoesTexto =
            item.opcoesDetalhe && item.opcoesDetalhe.length > 0
              ? item.opcoesDetalhe
                  .map(
                    (g) =>
                      `${g.grupo}: ${g.itens.map((i) => (i.preco > 0 ? `${i.nome} (+R$ ${i.preco.toFixed(2).replace('.', ',')})` : i.nome)).join(', ')}`
                  )
                  .join(' | ')
              : undefined;
          return {
            nome: item.produto.nome,
            quantidade: item.quantidade,
            preco: unit,
            subtotal: unit * item.quantidade,
            opcoes: opcoesTexto,
          };
        }),
        total: totalGeral,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end">
      <div className="bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250 border-l border-[#E0E0E0] dark:border-[#333333] transition-colors">
        
        {/* Header */}
        <div className="p-4 border-b border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between bg-[#F5F7FB] dark:bg-[#2C2C2C]/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="font-extrabold text-lg text-[#212529] dark:text-[#FFFFFF]">Seu Pedido ({cart.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#6C757D] dark:text-[#B0BEC5] font-bold flex items-center justify-center hover:opacity-80 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-[#6C757D] dark:text-[#B0BEC5] space-y-2">
              <span className="text-4xl">🛒</span>
              <p className="font-bold text-sm text-[#212529] dark:text-[#FFFFFF]">Seu carrinho está vazio.</p>
              <p className="text-xs">Adicione produtos do catálogo para finalizar seu pedido.</p>
            </div>
          ) : (
            <>
              {/* Item Rows */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-[#212529] dark:text-[#FFFFFF]">{item.produto.nome}</h4>
                        <p className="text-xs font-semibold text-[#6C757D] dark:text-[#B0BEC5]">
                          R$ {(Number(item.produto.preco) + (item.acrescimo || 0)).toFixed(2).replace('.', ',')} cada
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Selected Options with Prices */}
                    {item.opcoesDetalhe && item.opcoesDetalhe.length > 0 && (
                      <div className="flex flex-wrap gap-1 text-[10px] text-[#6C757D] dark:text-[#B0BEC5]">
                        {item.opcoesDetalhe.map((g, gi) => (
                          <span key={gi} className="bg-[#EDF2F7] dark:bg-[#2C2C2C] px-2 py-0.5 rounded-md font-medium">
                            {g.grupo}: {g.itens.map((i) => (i.preco > 0 ? `${i.nome} +R$${i.preco.toFixed(2).replace('.', ',')}` : i.nome)).join(', ')}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.observacoes && (
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md">
                        Obs: {item.observacoes}
                      </p>
                    )}

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#E0E0E0] dark:border-[#333333]">
                      <div className="flex items-center gap-2 bg-[#EDF2F7] dark:bg-[#2C2C2C] px-2 py-1 rounded-lg">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] font-bold text-xs shadow-2xs flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs px-1 text-[#212529] dark:text-[#FFFFFF]">{item.quantidade}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] font-bold text-xs shadow-2xs flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-sm text-[#212529] dark:text-[#FFFFFF]">
                        R$ {((item.produto.preco + (item.acrescimo || 0)) * item.quantidade).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Options Form */}
              <div className="pt-4 border-t border-[#E0E0E0] dark:border-[#333333] space-y-4">
                <h3 className="font-bold text-xs text-[#6C757D] dark:text-[#B0BEC5] uppercase tracking-wider">Dados para o Envio</h3>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Seu Nome</span>
                  </label>
                  <input
                    type="text"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-xs text-[#212529] dark:text-[#FFFFFF] outline-none"
                  />
                </div>

                {/* Delivery Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">Tipo de Pedido:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOpcaoEntrega('entrega')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        opcaoEntrega === 'entrega'
                          ? 'bg-[#EDF2F7] dark:bg-[#2C2C2C] border-[#4F3BFF] dark:border-[#7C4DFF] text-[#4F3BFF] dark:text-[#A58BFF]'
                          : 'bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#333333] text-[#6C757D] dark:text-[#B0BEC5]'
                      }`}
                    >
                      🛵 Entrega em Domicílio
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpcaoEntrega('retirada')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        opcaoEntrega === 'retirada'
                          ? 'bg-[#EDF2F7] dark:bg-[#2C2C2C] border-[#4F3BFF] dark:border-[#7C4DFF] text-[#4F3BFF] dark:text-[#A58BFF]'
                          : 'bg-white dark:bg-[#1E1E1E] border-[#E0E0E0] dark:border-[#333333] text-[#6C757D] dark:text-[#B0BEC5]'
                      }`}
                    >
                      🏪 Retirar no Local
                    </button>
                  </div>
                </div>

                {/* Delivery Address */}
                {opcaoEntrega === 'entrega' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Endereço de Entrega</span>
                    </label>
                    <input
                      type="text"
                      value={enderecoEntrega}
                      onChange={(e) => setEnderecoEntrega(e.target.value)}
                      placeholder="Rua, Número, Bairro, Apto..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-xs text-[#212529] dark:text-[#FFFFFF] outline-none"
                    />
                  </div>
                )}

                {/* Payment Method */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Forma de Pagamento:</span>
                  </label>
                  <Select
                    value={formaPagamento}
                    onChange={(v) => setFormaPagamento(String(v))}
                    options={[
                      { value: 'PIX', label: '⚡ PIX (Chave enviada no WhatsApp)' },
                      { value: 'Cartão de Crédito', label: '💳 Cartão de Crédito' },
                      { value: 'Cartão de Débito', label: '💳 Cartão de Débito' },
                      { value: 'Dinheiro', label: '💵 Dinheiro' },
                    ]}
                    buttonClassName="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-xs bg-white dark:bg-[#1E1E1E]"
                  />
                </div>

                {formaPagamento === 'Dinheiro' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">Troco para quanto?</label>
                    <input
                      type="text"
                      value={trocoPara}
                      onChange={(e) => setTrocoPara(e.target.value)}
                      placeholder="Ex: R$ 50,00 ou Não preciso de troco"
                      className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-xs text-[#212529] dark:text-[#FFFFFF] outline-none"
                    />
                  </div>
                )}

                {/* General Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">Observações Gerais do Pedido:</label>
                  <textarea
                    rows={2}
                    value={observacoesGerais}
                    onChange={(e) => setObservacoesGerais(e.target.value)}
                    placeholder="Instruções de entrega, ponto de referência..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-xs text-[#212529] dark:text-[#FFFFFF] outline-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer with Total & Send to WhatsApp */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-[#E0E0E0] dark:border-[#333333] bg-[#F5F7FB] dark:bg-[#2C2C2C]/50 space-y-3">
            <div className="flex items-center justify-between text-base font-extrabold text-[#212529] dark:text-[#FFFFFF]">
              <span>Total do Pedido:</span>
              <span style={{ color: primaryColor }}>
                R$ {totalGeral.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <button
              onClick={handleSendWhatsApp}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:opacity-95"
              style={{ backgroundColor: primaryColor, color: primaryContrast }}
            >
              <Send className="w-4 h-4" />
              <span>Enviar Pedido pelo WhatsApp</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
