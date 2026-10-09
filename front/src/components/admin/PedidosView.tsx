import React, { useState, useMemo } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Pedido, PedidoStatus } from '../../types';
import { ArrowLeft,Check, RefreshCw, Send, Clock, Download, Share2, X, Phone, Moon, Sun, ChefHat, Truck, CheckCircle2,Inbox, Flame, Search } from 'lucide-react';

type Filtro = 'esteira' | 'todos' | 'novo' | 'preparando' | 'pronto' | 'concluido' | 'hoje' | 'mes';
type PeriodoExp = 'hoje' | 'mes' | 'todos' | 'custom';

const PALETA_PEDIDOS = [
  { bg: 'bg-emerald-500', text: 'text-emerald-950', badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500', hex: '#10B981', label: '🟢' },
  { bg: 'bg-blue-500', text: 'text-blue-950', badge: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800', dot: 'bg-blue-500', hex: '#3B82F6', label: '🔵' },
  { bg: 'bg-amber-500', text: 'text-amber-950', badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800', dot: 'bg-amber-500', hex: '#F59E0B', label: '🟠' },
  { bg: 'bg-purple-500', text: 'text-purple-950', badge: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800', dot: 'bg-purple-500', hex: '#8B5CF6', label: '🟣' },
  { bg: 'bg-pink-500', text: 'text-pink-950', badge: 'bg-pink-100 dark:bg-pink-950/80 text-pink-800 dark:text-pink-300 border-pink-300 dark:border-pink-800', dot: 'bg-pink-500', hex: '#EC4899', label: '🌸' },
  { bg: 'bg-cyan-500', text: 'text-cyan-950', badge: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800', dot: 'bg-cyan-500', hex: '#06B6D4', label: '💎' },
  { bg: 'bg-rose-500', text: 'text-rose-950', badge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800', dot: 'bg-rose-500', hex: '#F43F5E', label: '🔴' },
  { bg: 'bg-indigo-500', text: 'text-indigo-950', badge: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800', dot: 'bg-indigo-500', hex: '#6366F1', label: '🫐' },
  { bg: 'bg-lime-500', text: 'text-lime-950', badge: 'bg-lime-100 dark:bg-lime-950/80 text-lime-800 dark:text-lime-300 border-lime-300 dark:border-lime-800', dot: 'bg-lime-500', hex: '#84CC16', label: '🍏' },
  { bg: 'bg-teal-500', text: 'text-teal-950', badge: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800', dot: 'bg-teal-500', hex: '#14B8A6', label: '🩵' },
];

const getCorPedido = (pId: string, idx: number) => {
  let hash = 0;
  for (let i = 0; i < pId.length; i++) hash += pId.charCodeAt(i);
  return PALETA_PEDIDOS[(Math.abs(hash) + idx) % PALETA_PEDIDOS.length];
};

const ETAPAS: { status: PedidoStatus; label: string; num: number; icon: React.ReactNode; corHex: string }[] = [
  { status: 'novo', label: 'Recebido', num: 1, icon: <Inbox className="w-3.5 h-3.5" />, corHex: '#F59E0B' },
  { status: 'preparando', label: 'Em Preparo', num: 2, icon: <ChefHat className="w-3.5 h-3.5" />, corHex: '#3B82F6' },
  { status: 'pronto', label: 'Pronto / A Sair', num: 3, icon: <Truck className="w-3.5 h-3.5" />, corHex: '#F97316' },
  { status: 'concluido', label: 'Concluído', num: 4, icon: <CheckCircle2 className="w-3.5 h-3.5" />, corHex: '#10B981' },
];

const ehHoje = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

const ehMes = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

export const PedidosView: React.FC = () => {
  const { pedidos, atualizarStatusPedido, activeSlug, setActiveView, empresa, isDarkMode, toggleDarkMode } = useCatalog();
  const [filtro, setFiltro] = useState<Filtro>('esteira');
  const [busca, setBusca] = useState('');

  const [exportAberto, setExportAberto] = useState(false);
  const [periodoExp, setPeriodoExp] = useState<PeriodoExp>('hoje');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [usarCadastrado, setUsarCadastrado] = useState(true);
  const [novoNumero, setNovoNumero] = useState('');
  const [erroExp, setErroExp] = useState('');

  // Contagens e Métricas
  const hoje = pedidos.filter((p) => ehHoje(p.data));
  const mes = pedidos.filter((p) => ehMes(p.data));
  
  const novos = pedidos.filter((p) => p.status === 'novo');
  const preparando = pedidos.filter((p) => p.status === 'preparando');
  const prontos = pedidos.filter((p) => p.status === 'pronto');
  const concluidos = pedidos.filter((p) => p.status === 'concluido');

  // Pedidos ativamente na esteira (em produção/entrega)
  const naEsteira = pedidos.filter((p) => p.status !== 'concluido');

  const totalHoje = hoje.reduce((acc, p) => acc + p.total, 0);
  const totalMes = mes.reduce((acc, p) => acc + p.total, 0);

  const getStepIndex = (status: PedidoStatus): number => {
    switch (status) {
      case 'novo': return 0;
      case 'preparando': return 1;
      case 'pronto': return 2;
      case 'concluido': return 3;
      default: return 0;
    }
  };

  const proximoStatus = (current: PedidoStatus): PedidoStatus => {
    switch (current) {
      case 'novo': return 'preparando';
      case 'preparando': return 'pronto';
      case 'pronto': return 'concluido';
      case 'concluido': return 'novo';
      default: return 'novo';
    }
  };

  const mudarEtapa = (p: Pedido, novoStatus: PedidoStatus) => {
    if (!activeSlug) return;
    atualizarStatusPedido(activeSlug, p.id, novoStatus);
  };

  const filtrar = (p: Pedido) => {
    // Filtro de texto por cliente, mesa ou id
    if (busca.trim()) {
      const q = busca.toLowerCase();
      const matchCli = p.cliente?.toLowerCase().includes(q);
      const matchEnd = p.endereco?.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      if (!matchCli && !matchEnd && !matchId) return false;
    }

    switch (filtro) {
      case 'esteira':
        return p.status !== 'concluido';
      case 'novo':
        return p.status === 'novo';
      case 'preparando':
        return p.status === 'preparando';
      case 'pronto':
        return p.status === 'pronto';
      case 'concluidos':
      case 'concluido':
        return p.status === 'concluido';
      case 'hoje':
        return ehHoje(p.data);
      case 'mes':
        return ehMes(p.data);
      default:
        return true;
    }
  };

  const visiveis = pedidos.filter(filtrar);

  // Dados para o Relógio de Status (Donut Segmentado SVG)
  const relogioData = useMemo(() => {
    const total = pedidos.length;
    if (total === 0) {
      return {
        countEsteira: 0,
        segNovos: 0,
        segPrep: 0,
        segPronto: 0,
        segConc: 0,
        hasOrders: false,
      };
    }

    return {
      countEsteira: naEsteira.length,
      segNovos: (novos.length / total) * 100,
      segPrep: (preparando.length / total) * 100,
      segPronto: (prontos.length / total) * 100,
      segConc: (concluidos.length / total) * 100,
      hasOrders: true,
    };
  }, [pedidos.length, naEsteira.length, novos.length, preparando.length, prontos.length, concluidos.length]);

  const selecionarPeriodo = (): { lista: Pedido[]; rotulo: string } => {
    switch (periodoExp) {
      case 'mes':
        return { lista: mes, rotulo: 'Este mês' };
      case 'todos':
        return { lista: pedidos, rotulo: 'Todos' };
      case 'custom': {
        const ini = dataInicio ? new Date(`${dataInicio}T00:00:00`).getTime() : -Infinity;
        const fim = dataFim ? new Date(`${dataFim}T23:59:59`).getTime() : Infinity;
        const lista = pedidos.filter((p) => p.data >= ini && p.data <= fim);
        return {
          lista,
          rotulo: `${dataInicio ? new Date(ini).toLocaleDateString('pt-BR') : 'início'} a ${
            dataFim ? new Date(fim).toLocaleDateString('pt-BR') : 'hoje'
          }`,
        };
      }
      default:
        return { lista: hoje, rotulo: 'Hoje' };
    }
  };

  const gerarRelatorio = (lista: Pedido[], rotulo: string): string => {
    let msg = `*RELATÓRIO DE PEDIDOS — ${empresa.nome || 'Loja'}*\n`;
    msg += `*Período:* ${rotulo}\n`;
    msg += `Gerado em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
    msg += `------------------------------------\n`;
    if (lista.length === 0) {
      msg += `Nenhum pedido no período.\n`;
    } else {
      lista.forEach((p, idx) => {
        const dataHora = `${new Date(p.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${new Date(
          p.data
        ).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        const statusLabel =
          p.status === 'novo'
            ? 'Recebido'
            : p.status === 'preparando'
            ? 'Em Preparo'
            : p.status === 'pronto'
            ? 'Pronto / A Sair'
            : 'Concluído';
        msg += `\n*${idx + 1}. ${p.cliente || 'Sem nome'}* — ${dataHora}\n`;
        msg += `   • Status: ${statusLabel}\n`;
        msg += `   • Tipo: ${p.tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada'}\n`;
        msg += `   • Pagamento: ${p.formaPagamento}\n`;
        if (p.endereco) msg += `   • Endereço: ${p.endereco}\n`;
        p.itens.forEach((i) => {
          msg += `   - ${i.quantidade}x ${i.nome} - R$ ${i.subtotal.toFixed(2).replace('.', ',')}\n`;
        });
        msg += `   *Subtotal: R$ ${p.total.toFixed(2).replace('.', ',')}*\n`;
      });
    }
    const total = lista.reduce((acc, p) => acc + p.total, 0);
    msg += `------------------------------------\n`;
    msg += `*Resumo:* ${lista.length} pedido(s) · *Faturamento: R$ ${total.toFixed(2).replace('.', ',')}*\n`;
    return msg;
  };

  const confirmarEnvio = () => {
    setErroExp('');
    const raw = usarCadastrado ? (empresa.whatsapp || '') : novoNumero.trim();
    const phone = raw.replace(/[^0-9]/g, '');
    if (!phone) {
      setErroExp(usarCadastrado ? 'Nenhum WhatsApp cadastrado na loja. Informe um número.' : 'Informe um número válido.');
      return;
    }
    const { lista, rotulo } = selecionarPeriodo();
    const msg = gerarRelatorio(lista, rotulo);
    window.open(`https://wa.me/${phone.startsWith('55') ? phone : '55' + phone}?text=${encodeURIComponent(msg)}`, '_blank');
    setExportAberto(false);
  };

  const abrirNoWhatsApp = (p: Pedido) => {
    const rawPhone = empresa.whatsapp || '';
    const phone = rawPhone.replace(/[^0-9]/g, '');
    if (!phone) {
      alert('WhatsApp da empresa não configurado.');
      return;
    }
    const statusLabel =
      p.status === 'novo'
        ? '📥 Recebido'
        : p.status === 'preparando'
        ? '👨‍🍳 Em Preparo'
        : p.status === 'pronto'
        ? '📦 Pronto / A Sair'
        : '✅ Concluído';

    let msg = `*CÓPIA DO PEDIDO Nº ${p.cliente || p.id}*\n`;
    msg += `*Status:* ${statusLabel}\n\n`;
    p.itens.forEach((i) => {
      msg += `*${i.quantidade}x ${i.nome}* - R$ ${i.subtotal.toFixed(2).replace('.', ',')}\n`;
    });
    msg += `------------------------------------\n`;
    msg += `*TOTAL: R$ ${p.total.toFixed(2).replace('.', ',')}*\n`;
    if (p.cliente) msg += `\n👤 *Cliente:* ${p.cliente}\n`;
    msg += `📍 *Tipo:* ${p.tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada'}\n`;
    if (p.endereco) msg += `🏠 *Endereço:* ${p.endereco}\n`;
    msg += `💳 *Pagamento:* ${p.formaPagamento}\n`;
    if (p.trocoPara) msg += `💵 *Troco para:* ${p.trocoPara}\n`;
    if (p.observacoes) msg += `📝 *Obs:* ${p.observacoes}\n`;
    window.open(`https://wa.me/${phone.startsWith('55') ? phone : '55' + phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#121212] text-[#212529] dark:text-[#FFFFFF] pb-20 transition-colors duration-200">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-md border-b border-[#E0E0E0] dark:border-[#333333] shadow-2xs transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-[#2C2C2C] border border-[#E0E0E0] dark:border-[#333333] text-indigo-600 dark:text-[#A58BFF] flex items-center justify-center font-bold text-xl shadow-2xs">
              🧾
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-[#212529] dark:text-[#FFFFFF] leading-tight flex items-center gap-1.5">
                <span>Pedidos & Esteira</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black uppercase">
                  Ao Vivo
                </span>
              </h1>
              <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5] font-medium">
                {empresa.nome || 'Minha Loja'} · {pedidos.length} pedido(s) registrado(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#2C2C2C] text-[#212529] dark:text-amber-400 hover:brightness-95 transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
              title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setExportAberto(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
              title="Exportar faturamento e enviar pelo WhatsApp"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className="px-3.5 py-2 rounded-xl bg-[#212529] dark:bg-[#2C2C2C] hover:bg-slate-800 dark:hover:bg-[#383838] text-white font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 border border-transparent dark:border-[#333333]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Painel</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-5 space-y-6">
        
        {/* 🕒 1. O "RELÓGIO DE STATUS" (Resumo Visual Circular & Fatias Coloridas) */}
        <section className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-[#E0E0E0] dark:border-[#333333] p-5 sm:p-6 shadow-sm space-y-5 transition-colors">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Gauge Circular do Relógio */}
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
              <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center flex-shrink-0">
                
                {/* SVG Ring com Arcos Segmentados */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                  {/* Trilha de fundo */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="stroke-slate-100 dark:stroke-[#2A2A2A]"
                    strokeWidth="10"
                    fill="transparent"
                  />

                  {/* Arco 1: Novos / Recebidos (Amarelo) */}
                  {novos.length > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="#F59E0B"
                      strokeWidth="10"
                      strokeDasharray={`${(relogioData.segNovos * 301.59) / 100} 301.59`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  )}

                  {/* Arco 2: Em Preparo (Azul) */}
                  {preparando.length > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="#3B82F6"
                      strokeWidth="10"
                      strokeDasharray={`${(relogioData.segPrep * 301.59) / 100} 301.59`}
                      strokeDashoffset={`-${(relogioData.segNovos * 301.59) / 100}`}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  )}

                  {/* Arco 3: Prontos (Laranja) */}
                  {prontos.length > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="#F97316"
                      strokeWidth="10"
                      strokeDasharray={`${(relogioData.segPronto * 301.59) / 100} 301.59`}
                      strokeDashoffset={`-${((relogioData.segNovos + relogioData.segPrep) * 301.59) / 100}`}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  )}

                  {/* Arco 4: Concluídos (Verde) */}
                  {concluidos.length > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="#10B981"
                      strokeWidth="10"
                      strokeDasharray={`${(relogioData.segConc * 301.59) / 100} 301.59`}
                      strokeDashoffset={`-${((relogioData.segNovos + relogioData.segPrep + relogioData.segPronto) * 301.59) / 100}`}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  )}
                </svg>

                {/* Centro do Relógio: Número & Status */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>AO VIVO</span>
                  </div>
                  <span className="text-3xl sm:text-4xl font-black text-[#212529] dark:text-[#FFFFFF] leading-none tracking-tight">
                    {naEsteira.length}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#6C757D] dark:text-[#B0BEC5] uppercase tracking-wider mt-0.5">
                    Na Esteira
                  </span>
                </div>
              </div>

              {/* Descrição e Faturamento Rápido */}
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-[#7C4DFF]/15 border border-indigo-200 dark:border-[#7C4DFF]/30 text-indigo-700 dark:text-[#A58BFF] text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fluxo em Tempo Real</span>
                </div>
                <h3 className="text-lg font-black text-[#212529] dark:text-[#FFFFFF] leading-tight">
                  Relógio de Produção
                </h3>
                <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5] max-w-sm leading-relaxed">
                  Acompanhe a capacidade de produção e toque nas fatias coloridas para focar nos pedidos em cada etapa.
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs font-semibold text-[#6C757D] dark:text-[#B0BEC5] justify-center sm:justify-start">
                  <span>Hoje: <strong>R$ {totalHoje.toFixed(2).replace('.', ',')}</strong></span>
                  <span>·</span>
                  <span>Mês: <strong>R$ {totalMes.toFixed(2).replace('.', ',')}</strong></span>
                </div>
              </div>
            </div>

            {/* Fatias e Contadores Interativos do Relógio */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto flex-1 lg:max-w-xl">
              
              {/* Fatia 1: Recebidos */}
              <button
                onClick={() => setFiltro(filtro === 'novo' ? 'esteira' : 'novo')}
                className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-2 ${
                  filtro === 'novo'
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                    : 'border-[#E0E0E0] dark:border-[#333333] bg-[#F5F7FB] dark:bg-[#262626] hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">🟡</span>
                  <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full">
                    Etapa 1
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#212529] dark:text-[#FFFFFF]">{novos.length}</p>
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">Recebidos</p>
                </div>
              </button>

              {/* Fatia 2: Em Preparo */}
              <button
                onClick={() => setFiltro(filtro === 'preparando' ? 'esteira' : 'preparando')}
                className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-2 ${
                  filtro === 'preparando'
                    ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                    : 'border-[#E0E0E0] dark:border-[#333333] bg-[#F5F7FB] dark:bg-[#262626] hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">🔵</span>
                  <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
                    Etapa 2
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#212529] dark:text-[#FFFFFF]">{preparando.length}</p>
                  <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300">Em Preparo</p>
                </div>
              </button>

              {/* Fatia 3: Prontos / A Sair */}
              <button
                onClick={() => setFiltro(filtro === 'pronto' ? 'esteira' : 'pronto')}
                className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-2 ${
                  filtro === 'pronto'
                    ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/30'
                    : 'border-[#E0E0E0] dark:border-[#333333] bg-[#F5F7FB] dark:bg-[#262626] hover:border-orange-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">🟠</span>
                  <span className="text-[10px] font-black uppercase text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/80 px-2 py-0.5 rounded-full">
                    Etapa 3
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#212529] dark:text-[#FFFFFF]">{prontos.length}</p>
                  <p className="text-[11px] font-bold text-orange-700 dark:text-orange-300">Prontos / A Sair</p>
                </div>
              </button>

              {/* Fatia 4: Concluídos */}
              <button
                onClick={() => setFiltro(filtro === 'concluido' ? 'esteira' : 'concluido')}
                className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-2 ${
                  filtro === 'concluido'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                    : 'border-[#E0E0E0] dark:border-[#333333] bg-[#F5F7FB] dark:bg-[#262626] hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">🟢</span>
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                    Etapa 4
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#212529] dark:text-[#FFFFFF]">{concluidos.length}</p>
                  <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Já Saíram</p>
                </div>
              </button>

            </div>
          </div>
        </section>

        {/* Barra de Filtros Rápidos e Busca */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              onClick={() => setFiltro('esteira')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                filtro === 'esteira'
                  ? 'bg-indigo-600 dark:bg-[#7C4DFF] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#B0BEC5] border border-[#E0E0E0] dark:border-[#333333] hover:bg-slate-50 dark:hover:bg-[#2C2C2C]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Na Esteira ({naEsteira.length})</span>
            </button>

            <button
              onClick={() => setFiltro('todos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filtro === 'todos'
                  ? 'bg-indigo-600 dark:bg-[#7C4DFF] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#B0BEC5] border border-[#E0E0E0] dark:border-[#333333] hover:bg-slate-50 dark:hover:bg-[#2C2C2C]'
              }`}
            >
              Todos ({pedidos.length})
            </button>

            <button
              onClick={() => setFiltro('hoje')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filtro === 'hoje'
                  ? 'bg-indigo-600 dark:bg-[#7C4DFF] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#B0BEC5] border border-[#E0E0E0] dark:border-[#333333] hover:bg-slate-50 dark:hover:bg-[#2C2C2C]'
              }`}
            >
              Hoje ({hoje.length})
            </button>

            <button
              onClick={() => setFiltro('mes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filtro === 'mes'
                  ? 'bg-indigo-600 dark:bg-[#7C4DFF] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#B0BEC5] border border-[#E0E0E0] dark:border-[#333333] hover:bg-slate-50 dark:hover:bg-[#2C2C2C]'
              }`}
            >
              Este Mês ({mes.length})
            </button>
          </div>

          {/* Busca por cliente ou pedido */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente, mesa ou nº..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-xs text-[#212529] dark:text-[#FFFFFF] placeholder:text-slate-400 dark:placeholder:text-[#757575] outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 🚥 2. CARTÕES DE STEPS COM ETIQUETAS COLORIDAS */}
        {visiveis.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] space-y-3 transition-colors">
            <p className="text-5xl">🕒</p>
            <p className="font-extrabold text-base text-[#212529] dark:text-[#FFFFFF]">Nenhum pedido encontrado neste filtro.</p>
            <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5] max-w-sm mx-auto">
              Quando os clientes enviarem pedidos pelo catálogo digital, eles aparecerão aqui em tempo real na esteira.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visiveis.map((p, idx) => {
              const cor = getCorPedido(p.id, idx);
              const stepAtual = getStepIndex(p.status);
              const proxStatus = proximoStatus(p.status);

              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-4 sm:p-5 shadow-xs space-y-4 transition-all hover:border-slate-300 dark:hover:border-[#444444]"
                >
                  
                  {/* Top Row: Etiqueta Colorida + Identificador + Cliente/Mesa + Valor */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-[#2C2C2C] pb-3.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      
                      {/* Etiqueta Colorida com Número do Pedido */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border shadow-2xs ${cor.badge}`}
                      >
                        <span>{cor.label}</span>
                        <span>Pedido #{idx + 101}</span>
                      </span>

                      {/* Nome do Cliente ou Mesa */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm sm:text-base text-[#212529] dark:text-[#FFFFFF]">
                          {p.cliente || 'Cliente'}
                        </span>
                        <span className="text-xs text-[#6C757D] dark:text-[#B0BEC5] font-medium">
                          · {new Date(p.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Badge de Entrega / Retirada */}
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#212529] dark:text-[#B0BEC5]">
                        {p.tipoEntrega === 'entrega' ? '🚚 Entrega' : '🏪 Retirada no Balcão'}
                      </span>
                    </div>

                    {/* Total em Destaque */}
                    <div className="text-right">
                      <p className="text-lg font-black text-[#212529] dark:text-[#FFFFFF] leading-tight">
                        R$ {p.total.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-[10px] font-bold text-[#6C757D] dark:text-[#B0BEC5] uppercase tracking-wider">
                        {p.formaPagamento}
                      </p>
                    </div>
                  </div>

                  {/* 🚥 Linha de Steps da Esteira (Etapas 1 a 4) */}
                  <div className="bg-[#F5F7FB] dark:bg-[#262626] p-3.5 rounded-2xl border border-[#E0E0E0] dark:border-[#383838] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] px-1">
                      <span>Esteira de Produção:</span>
                      <span className="text-[11px] font-extrabold text-indigo-600 dark:text-[#A58BFF]">
                        Etapa {stepAtual + 1} de 4 · {ETAPAS[stepAtual].label}
                      </span>
                    </div>

                    {/* Stepper Interativo */}
                    <div className="grid grid-cols-4 gap-1 sm:gap-2">
                      {ETAPAS.map((etapa, eIdx) => {
                        const isDone = stepAtual > eIdx;
                        const isCurrent = stepAtual === eIdx;

                        return (
                          <button
                            key={etapa.status}
                            type="button"
                            onClick={() => mudarEtapa(p, etapa.status)}
                            className={`p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-1 relative ${
                              isCurrent
                                ? 'bg-white dark:bg-[#1E1E1E] shadow-sm border-2'
                                : isDone
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 opacity-85'
                                : 'bg-white/60 dark:bg-[#1E1E1E]/50 border border-slate-200 dark:border-[#333333] opacity-60 hover:opacity-100'
                            }`}
                            style={{
                              borderColor: isCurrent ? etapa.corHex : undefined,
                            }}
                            title={`Mudar para: ${etapa.label}`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                  isCurrent
                                    ? 'text-white'
                                    : isDone
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                                style={{
                                  backgroundColor: isCurrent ? etapa.corHex : undefined,
                                }}
                              >
                                {isDone ? '✓' : etapa.num}
                              </span>
                              <span className="text-xs hidden sm:inline">{etapa.icon}</span>
                            </div>
                            <span
                              className={`text-[10px] sm:text-xs font-black truncate ${
                                isCurrent
                                  ? 'text-[#212529] dark:text-[#FFFFFF]'
                                  : isDone
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {etapa.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-[#6C757D] dark:text-[#B0BEC5] uppercase tracking-wider">
                      Itens do Pedido:
                    </p>
                    <div className="space-y-1 text-xs">
                      {p.itens.map((item, iIdx) => (
                        <div key={iIdx} className="flex justify-between items-start gap-2 bg-[#F5F7FB] dark:bg-[#262626] p-2 rounded-xl">
                          <div>
                            <span className="font-extrabold text-[#212529] dark:text-[#FFFFFF]">
                              {item.quantidade}x {item.nome}
                            </span>
                            {item.opcoes && (
                              <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5] pl-2 mt-0.5">
                                ↳ {item.opcoes}
                              </p>
                            )}
                          </div>
                          <span className="font-extrabold text-[#212529] dark:text-[#FFFFFF] whitespace-nowrap">
                            R$ {item.subtotal.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detalhes de Endereço e Observações */}
                  {(p.endereco || p.observacoes || p.trocoPara) && (
                    <div className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5] space-y-1 bg-slate-50 dark:bg-[#262626]/60 p-2.5 rounded-xl border border-slate-100 dark:border-[#333333]">
                      {p.endereco && <p>📍 <strong>Endereço:</strong> {p.endereco}</p>}
                      {p.trocoPara && <p>💵 <strong>Troco para:</strong> {p.trocoPara}</p>}
                      {p.observacoes && <p>📝 <strong>Observação:</strong> {p.observacoes}</p>}
                    </div>
                  )}

                  {/* Rodapé de Ações do Pedido */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#2C2C2C]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => mudarEtapa(p, proxStatus)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                          p.status === 'concluido'
                            ? 'bg-amber-500 hover:bg-amber-400 text-white'
                            : p.status === 'pronto'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {p.status === 'concluido' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reabrir Pedido</span>
                          </>
                        ) : p.status === 'pronto' ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Marcar como Entregue / Já Saiu</span>
                          </>
                        ) : p.status === 'preparando' ? (
                          <>
                            <Truck className="w-3.5 h-3.5" />
                            <span>Avançar para Pronto / A Sair</span>
                          </>
                        ) : (
                          <>
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Iniciar Preparo</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirNoWhatsApp(p)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#212529] dark:text-[#B0BEC5] hover:bg-slate-200 dark:hover:bg-[#383838] transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-[#ADB5BD] dark:text-[#757575] font-mono">
                      ID: {p.id.slice(0, 10)}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de Exportação do Faturamento */}
      {exportAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xl p-6 space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-[#212529] dark:text-[#FFFFFF] flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Exportar Faturamento
              </h3>
              <button onClick={() => setExportAberto(false)} className="p-1.5 text-[#6C757D] dark:text-[#B0BEC5] hover:text-[#212529] dark:hover:text-[#FFFFFF] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Período */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#212529] dark:text-[#FFFFFF]">Período</label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['hoje', 'Hoje'],
                    ['mes', 'Este mês'],
                    ['todos', 'Todos'],
                    ['custom', 'Período'],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setPeriodoExp(k)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      periodoExp === k
                        ? 'bg-emerald-600 dark:bg-emerald-700 text-white border-emerald-600 dark:border-emerald-700'
                        : 'bg-white dark:bg-[#2C2C2C] text-[#6C757D] dark:text-[#B0BEC5] border-[#E0E0E0] dark:border-[#333333]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {periodoExp === 'custom' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-[#6C757D] dark:text-[#B0BEC5]">De</label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#2C2C2C] text-[#212529] dark:text-[#FFFFFF] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#6C757D] dark:text-[#B0BEC5]">Até</label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#2C2C2C] text-[#212529] dark:text-[#FFFFFF] text-xs"
                    />
                  </div>
                </div>
              )}
              <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">
                {(() => {
                  const s = selecionarPeriodo();
                  const total = s.lista.reduce((acc, p) => acc + p.total, 0);
                  return `${s.lista.length} pedido(s) · R$ ${total.toFixed(2).replace('.', ',')} (${s.rotulo})`;
                })()}
              </p>
            </div>

            {/* Whatsapp destino */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-[#212529] dark:text-[#FFFFFF] flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                Receber pelo WhatsApp
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-[#212529] dark:text-[#B0BEC5] cursor-pointer">
                  <input
                    type="radio"
                    checked={usarCadastrado}
                    onChange={() => setUsarCadastrado(true)}
                    className="accent-emerald-600"
                  />
                  Usar número cadastrado: {empresa.whatsapp || '(não informado)'}
                </label>
                <label className="flex items-center gap-2 text-xs text-[#212529] dark:text-[#B0BEC5] cursor-pointer">
                  <input
                    type="radio"
                    checked={!usarCadastrado}
                    onChange={() => setUsarCadastrado(false)}
                    className="accent-emerald-600"
                  />
                  Outro número
                </label>
                {!usarCadastrado && (
                  <input
                    type="tel"
                    value={novoNumero}
                    onChange={(e) => setNovoNumero(e.target.value)}
                    placeholder="Ex: 55 11 99999-9999"
                    className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#2C2C2C] text-[#212529] dark:text-[#FFFFFF] text-xs outline-none"
                  />
                )}
              </div>
              {erroExp && <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">{erroExp}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setExportAberto(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-[#6C757D] dark:text-[#B0BEC5] hover:bg-slate-50 dark:hover:bg-[#2C2C2C] font-bold text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEnvio}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Confirmar e Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};