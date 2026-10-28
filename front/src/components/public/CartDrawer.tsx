import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Select } from '../ui/Select';
import { useCatalog } from '../../context/CatalogContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Send,
  CreditCard,
  MapPin,
  User,
  Calendar,
  Clock,
  Sparkles,
  Scissors,
  Heart,
  Phone,
  Car,
  ExternalLink,
  AlertCircle,
  Check,
  CheckCircle2,
  UserCheck,
  LogOut,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';
import { getContrastText } from '../../utils/colors';
import { CartItem, Produto } from '../../types';
import { buildPetAgendamentoCalendarUrl, getPetAgendamentoParams } from '../../utils/googleCalendar';
import { toast } from '../ui/Toast';
import { isNichoAgendamento } from '../../data/nichos';
import { GoogleAgendaModal } from '../calendar/GoogleAgendaModal';

interface CartDrawerProps {
  onClose: () => void;
  onOpenProductModal?: (produto: Produto) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onClose, onOpenProductModal }) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    empresa,
    config,
    registrarPedido,
    adicionarAgendamento,
    activeSlug,
    categorias,
    nichoId,
  } = useCatalog();

  const {
    customer,
    isAuthenticated,
    selectedPetId,
    selectedPet,
    setSelectedPetId,
    openAuthModal,
    logout,
  } = useCustomerAuth();

  // Helper para identificar se um item ou o carrinho contém serviços
  const isServicoItem = (item: CartItem) => {
    const cat = categorias.find((c) => String(c.id) === String(item.produto.categoria));
    const nomeCat = cat ? cat.nome.toLowerCase() : '';
    const nomeProd = item.produto.nome.toLowerCase();
    return (
      nomeCat.includes('serviço') ||
      nomeCat.includes('servico') ||
      nomeCat.includes('banho') ||
      nomeCat.includes('tosa') ||
      nomeCat.includes('consulta') ||
      nomeCat.includes('vacina') ||
      nomeProd.includes('banho') ||
      nomeProd.includes('tosa') ||
      nomeProd.includes('consulta') ||
      Boolean(item.produto.duracao_estimada || item.produto.porte_indicado)
    );
  };

  const temServicos = cart.some(isServicoItem);
  const isAgendamentoNiche = isNichoAgendamento(nichoId) || temServicos;

  // Datas para agendamento
  const getTodayStr = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const proximosDias = [
    { label: 'Hoje', iso: getTodayStr(0), diaMes: getTodayStr(0).split('-').slice(1).reverse().join('/') },
    { label: 'Amanhã', iso: getTodayStr(1), diaMes: getTodayStr(1).split('-').slice(1).reverse().join('/') },
    { label: 'Em 2 dias', iso: getTodayStr(2), diaMes: getTodayStr(2).split('-').slice(1).reverse().join('/') },
    { label: 'Em 3 dias', iso: getTodayStr(3), diaMes: getTodayStr(3).split('-').slice(1).reverse().join('/') },
    { label: 'Em 4 dias', iso: getTodayStr(4), diaMes: getTodayStr(4).split('-').slice(1).reverse().join('/') },
  ];

  const HORARIOS_DISPONIVEIS = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00'
  ];

  // Estados do formulário
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [opcaoEntrega, setOpcaoEntrega] = useState<'entrega' | 'retirada'>('entrega');
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [trocoPara, setTrocoPara] = useState('');
  const [observacoesGerais, setObservacoesGerais] = useState('');

  // Estados específicos para Agendamento de Serviços e Pedidos
  const [dataAgendamento, setDataAgendamento] = useState(() => getTodayStr(0));
  const [horarioAgendamento, setHorarioAgendamento] = useState('09:30');
  const [petNome, setPetNome] = useState('');
  const [petPorte, setPetPorte] = useState('Pequeno (até 10kg)');
  const [petEspecie, setPetEspecie] = useState<'cao' | 'gato' | 'ave' | 'silvestre' | 'outro'>('cao');
  const [petObs, setPetObs] = useState('');
  const [modalidadeServico, setModalidadeServico] = useState<'presencial' | 'leva_e_traz'>('presencial');

  // Estados de erro para validação inline
  const [erros, setErros] = useState<{ clienteNome?: string; petNome?: string; enderecoEntrega?: string }>({});
  const clienteNomeRef = useRef<HTMLInputElement>(null);
  const petNomeRef = useRef<HTMLInputElement>(null);
  const enderecoRef = useRef<HTMLInputElement>(null);

  // Estado para Modal de Parâmetros do Google Agenda
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(false);

  // Sincronização automática com dados do tutor logado
  useEffect(() => {
    if (customer) {
      if (customer.name) setClienteNome(customer.name);
      if (customer.phone) setClienteTelefone(customer.phone);
    }
  }, [customer]);

  // Sincronização automática com dados do pet ativo
  useEffect(() => {
    if (selectedPet) {
      setPetNome(selectedPet.name);
      if (selectedPet.specialCare) {
        setPetObs(selectedPet.specialCare);
      }
      if (selectedPet.species) {
        const sp = selectedPet.species as 'cao' | 'gato' | 'ave' | 'silvestre' | 'outro';
        setPetEspecie(sp);
        if (sp === 'gato') {
          setPetPorte('Felino / Gato');
        }
      }
    }
  }, [selectedPet]);

  // Filtro de horários válidos: se for entrega hoje, exige no mínimo 1h a mais do horário atual
  const getHorariosValidos = React.useCallback(() => {
    const isHoje = dataAgendamento === getTodayStr(0);
    if (!isHoje) {
      return HORARIOS_DISPONIVEIS;
    }

    const agora = new Date();
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();

    if (opcaoEntrega === 'entrega') {
      // Exige no mínimo 1 hora a mais do horário que ele está para dar tempo da entrega ser feita
      const minutosLimite = (horaAtual + 1) * 60 + minutoAtual;
      return HORARIOS_DISPONIVEIS.filter((hr) => {
        const [h, m] = hr.split(':').map(Number);
        return h * 60 + m >= minutosLimite;
      });
    }

    // Se for retirada na loja hoje: dá margem de 15 minutos
    const minutosLimite = horaAtual * 60 + minutoAtual + 15;
    return HORARIOS_DISPONIVEIS.filter((hr) => {
      const [h, m] = hr.split(':').map(Number);
      return h * 60 + m >= minutosLimite;
    });
  }, [dataAgendamento, opcaoEntrega]);

  const horariosValidos = getHorariosValidos();

  // Garante que o horário selecionado seja válido na lista filtrada
  React.useEffect(() => {
    if (horariosValidos.length > 0 && !horariosValidos.includes(horarioAgendamento)) {
      setHorarioAgendamento(horariosValidos[0]);
    }
  }, [horariosValidos, horarioAgendamento]);

  const primaryColor = config.tema.cores.primary || '#0F766E';
  const primaryContrast = getContrastText(primaryColor);

  const totalGeral = cart.reduce(
    (acc, item) => acc + (Number(item.produto.preco) + (item.acrescimo || 0)) * item.quantidade,
    0
  );

  // Parâmetros estruturados para o modal do Google Agenda
  const calendarModalData = React.useMemo(() => {
    const servicoNome = temServicos
      ? (cart.map((i) => i.produto.nome).join(' + ') || 'Atendimento / Agendamento')
      : `Pedido: ${cart.map((i) => `${i.quantidade}x ${i.produto.nome}`).join(', ')}`;

    const opcoesTexto = cart
      .filter((i) => i.opcoesSelecionadas && i.opcoesSelecionadas.length > 0)
      .flatMap((i) => i.opcoesSelecionadas!)
      .map((g) => `${g.grupo}: ${g.itens.map((it) => it.nome).join(', ')}`)
      .join(' | ');

    return getPetAgendamentoParams({
      servicoNome,
      petNome: temServicos ? (petNome.trim() || 'Pet') : 'Pedido Produtos',
      petEspecie,
      petPorte,
      petObs: petObs.trim(),
      tutorNome: clienteNome.trim() || 'Tutor / Cliente',
      tutorTelefone: clienteTelefone.trim() || '',
      dataAgendada: dataAgendamento,
      horario: horarioAgendamento,
      modalidade: opcaoEntrega === 'entrega' ? 'Entrega em Domicílio' : 'Retirada na Loja',
      endereco: opcaoEntrega === 'entrega' ? enderecoEntrega.trim() : (empresa.endereco || ''),
      empresaNome: empresa.nome || 'Estabelecimento',
      ownerEmail: empresa.emailGoogleAgenda || empresa.email || '',
      valorTotal: totalGeral,
      opcoesTexto,
    });
  }, [
    temServicos,
    cart,
    petNome,
    petEspecie,
    petPorte,
    petObs,
    clienteNome,
    clienteTelefone,
    dataAgendamento,
    horarioAgendamento,
    opcaoEntrega,
    enderecoEntrega,
    empresa.endereco,
    empresa.nome,
    empresa.emailGoogleAgenda,
    empresa.email,
    totalGeral,
  ]);

  const handleSendWhatsApp = () => {
    // Gatekeeper: exigência estrita de cadastro/login
    if (!isAuthenticated) {
      toast.warning('Para agendar serviços ou realizar pedidos, faça login ou cadastre-se.');
      openAuthModal('register', () => {
        toast.success('Cadastro concluído com sucesso!');
      });
      return;
    }

    const rawPhone = empresa.whatsapp || empresa.telefone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

    if (!cleanPhone) {
      toast.error('O número de WhatsApp da empresa não está configurado.');
      return;
    }

    if (cart.length === 0) {
      toast.warning('Seu carrinho está vazio.');
      return;
    }

    const novosErros: { clienteNome?: string; petNome?: string; enderecoEntrega?: string } = {};

    if (!clienteNome.trim()) {
      novosErros.clienteNome = 'Por favor, informe seu nome para identificação.';
    }

    if (opcaoEntrega === 'entrega' && !enderecoEntrega.trim()) {
      novosErros.enderecoEntrega = 'Por favor, informe o endereço completo para a entrega.';
    }

    if (temServicos && nichoId === 'petshop' && !petNome.trim()) {
      novosErros.petNome = 'Por favor, informe o nome do seu pet para o agendamento do serviço.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      if (novosErros.clienteNome) {
        clienteNomeRef.current?.focus();
        clienteNomeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (novosErros.enderecoEntrega) {
        enderecoRef.current?.focus();
        enderecoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (novosErros.petNome) {
        petNomeRef.current?.focus();
        petNomeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErros({});

    let msg = isAgendamentoNiche
      ? `*NOVO AGENDAMENTO / PEDIDO - ${empresa.nome || 'Catálogo Digital'}*\n`
      : `*NOVO PEDIDO - ${empresa.nome || 'Catálogo Digital'}*\n`;
    msg += `------------------------------------\n`;

    msg += `👤 *Cliente / Tutor:* ${clienteNome.trim()}\n`;
    if (clienteTelefone.trim()) {
      msg += `📱 *WhatsApp:* ${clienteTelefone.trim()}\n`;
    }
    if (customer?.email) {
      msg += `✉️ *E-mail:* ${customer.email}\n`;
    }
    if (customer?.hasTransportBox !== undefined) {
      msg += `📦 *Caixa de Transporte:* ${customer.hasTransportBox ? 'Sim (possui)' : 'Não possui'}\n`;
    }

    const dataFormatada = dataAgendamento.split('-').reverse().join('/');

    if (opcaoEntrega === 'entrega') {
      msg += `\n🛵 *FORMA DE RECEBIMENTO: Entrega em Domicílio*\n`;
      if (enderecoEntrega.trim()) {
        msg += `🏠 *Endereço de Entrega:* ${enderecoEntrega.trim()}\n`;
      }
      msg += `📅 *AGENDAMENTO DA ENTREGA:*\n`;
      msg += `• *Data:* ${dataFormatada}\n`;
      msg += `• *Horário Previsto:* ${horarioAgendamento} (previsão com 1h+ para preparo e envio)\n`;
    } else {
      msg += `\n🏪 *FORMA DE RECEBIMENTO: Retirada na Loja*\n`;
      if (empresa.endereco) {
        msg += `📍 *Local de Retirada:* ${empresa.endereco}\n`;
      }
      msg += `📅 *AGENDAMENTO DA RETIRADA:*\n`;
      msg += `• *Data:* ${dataFormatada}\n`;
      msg += `• *Horário Previsto:* ${horarioAgendamento}\n`;
    }

    if (temServicos && (nichoId === 'petshop' || petNome.trim())) {
      const emojiPet = petEspecie === 'gato' ? '🐱 Gato' : petEspecie === 'ave' ? '🦜 Ave' : '🐶 Cão';
      const racaInfo = selectedPet?.breed ? ` · Raça: ${selectedPet.breed}` : '';
      msg += `\n🐾 *DADOS DO PET (SERVIÇO):*\n`;
      msg += `• *Pet:* ${petNome.trim() || 'Pet'} (${emojiPet} · ${petPorte}${racaInfo})\n`;
      if (selectedPet?.hasTransportBox !== undefined) {
        msg += `• *Caixa de Transporte do Pet:* ${selectedPet.hasTransportBox ? 'Sim' : 'Não'}\n`;
      }
      if (petObs.trim()) {
        msg += `• *Cuidados do Pet:* ${petObs.trim()}\n`;
      }
    }

    msg += `\n💳 *Forma de Pagamento:* ${formaPagamento}\n`;
    if (formaPagamento === 'Dinheiro' && trocoPara.trim()) {
      msg += `💵 *Troco para:* R$ ${trocoPara.trim()}\n`;
    }

    msg += `\n------------------------------------\n`;
    msg += `*ITENS / COMBINAÇÕES SELECIONADAS:*\n\n`;

    cart.forEach((item) => {
      const unit = Number(item.produto.preco) + (item.acrescimo || 0);
      const subtotal = unit * item.quantidade;
      msg += `*${item.quantidade}x ${item.produto.nome}* - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;

      if (item.opcoesDetalhe && item.opcoesDetalhe.length > 0) {
        msg += `   *Combinações & Opcionais:*\n`;
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
    msg += `*TOTAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}*\n`;

    if (observacoesGerais.trim()) {
      msg += `\n📝 *Observações:* ${observacoesGerais.trim()}\n`;
    }

    let googleCalUrl = '';
    if (isAgendamentoNiche) {
      const servicoNome = cart.map((i) => i.produto.nome).join(' + ');
      const opcoesTexto = cart
        .flatMap((i) => i.opcoesDetalhe || [])
        .map((g) => `${g.grupo}: ${g.itens.map((it) => it.nome).join(', ')}`)
        .join(' | ');

      googleCalUrl = buildPetAgendamentoCalendarUrl({
        servicoNome: temServicos
          ? (cart.map((i) => i.produto.nome).join(' + ') || 'Atendimento / Agendamento')
          : `Pedido: ${cart.map((i) => `${i.quantidade}x ${i.produto.nome}`).join(', ')}`,
        petNome: temServicos ? (petNome.trim() || 'Pet') : 'Pedido Produtos',
        petEspecie,
        petPorte,
        petObs: petObs.trim(),
        tutorNome: clienteNome.trim() || 'Tutor / Cliente',
        tutorTelefone: clienteTelefone.trim() || cleanPhone,
        dataAgendada: dataAgendamento,
        horario: horarioAgendamento,
        modalidade: opcaoEntrega === 'entrega' ? 'Entrega em Domicílio' : 'Retirada na Loja',
        endereco: opcaoEntrega === 'entrega' ? enderecoEntrega.trim() : (empresa.endereco || ''),
        empresaNome: empresa.nome || 'Estabelecimento',
        ownerEmail: empresa.emailGoogleAgenda || empresa.email || '',
        valorTotal: totalGeral,
        opcoesTexto,
      });

      msg += `\n📅 *SALVAR NA GOOGLE AGENDA (DONO DA LOJA):*\n${googleCalUrl}\n`;
    }

    msg += isAgendamentoNiche
      ? `\n_Agendamento solicitado via Catálogo Express_`
      : `\n_Pedido realizado via Catálogo Express_`;

    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodedMsg}`;

    window.open(whatsappUrl, '_blank');

    // Registra rastro no sistema (Exclusividade Mútua: Agendamento OU Pedido)
    if (activeSlug) {
      if (isAgendamentoNiche) {
        const primeiroServico = cart.find(isServicoItem) || cart[0];
        adicionarAgendamento(activeSlug, {
          dataAgendada: dataAgendamento,
          horario: horarioAgendamento,
          servicoId: primeiroServico ? primeiroServico.produto.id : 'item-01',
          servicoNome: temServicos
            ? cart.map((i) => i.produto.nome).join(' + ')
            : `Pedido: ${cart.map((i) => `${i.quantidade}x ${i.produto.nome}`).join(', ')}`,
          preco: totalGeral,
          pet: {
            nome: temServicos ? (petNome.trim() || 'Pet') : 'Pedido Produtos',
            especie: petEspecie,
            porte: petPorte.includes('Pequeno') ? 'pequeno' : petPorte.includes('Grande') ? 'grande' : 'medio',
            observacoes: [
              selectedPet?.breed ? `Raça: ${selectedPet.breed}` : '',
              petObs.trim() || '',
              customer?.hasTransportBox ? 'Tem caixa de transporte' : '',
            ].filter(Boolean).join(' | ') || undefined,
          },
          tutor: {
            nome: clienteNome.trim() || customer?.name || 'Cliente',
            whatsapp: clienteTelefone.trim() || customer?.phone || cleanPhone,
          },
          status: 'solicitado',
          googleCalendarUrl: googleCalUrl || undefined,
          observacoes: [
            opcaoEntrega === 'entrega' ? `🛵 Entrega: ${enderecoEntrega}` : `🏪 Retirada na Loja`,
            observacoesGerais.trim(),
          ]
            .filter(Boolean)
            .join(' | '),
        });
      } else {
        registrarPedido(activeSlug, {
          cliente: clienteNome.trim() || 'Cliente',
          tipoEntrega: opcaoEntrega,
          endereco: enderecoEntrega.trim() || undefined,
          formaPagamento,
          trocoPara: trocoPara.trim() || undefined,
          observacoes: observacoesGerais.trim() || undefined,
          itens: cart.map((item) => {
            const unit = Number(item.produto.preco) + (item.acrescimo || 0);
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
    }
  };

  const handleConfirmarAgendamentoModal = async () => {
    const novosErros: { clienteNome?: string; petNome?: string; enderecoEntrega?: string } = {};

    if (!clienteNome.trim()) {
      novosErros.clienteNome = 'Por favor, informe seu nome para identificação.';
    }

    if (opcaoEntrega === 'entrega' && !enderecoEntrega.trim()) {
      novosErros.enderecoEntrega = 'Por favor, informe o endereço completo para a entrega.';
    }

    if (temServicos && nichoId === 'petshop' && !petNome.trim()) {
      novosErros.petNome = 'Por favor, informe o nome do seu pet para o agendamento do serviço.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      toast.error('Preencha os campos obrigatórios antes de confirmar o agendamento.');
      if (novosErros.clienteNome) {
        clienteNomeRef.current?.focus();
        clienteNomeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (novosErros.enderecoEntrega) {
        enderecoRef.current?.focus();
        enderecoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (novosErros.petNome) {
        petNomeRef.current?.focus();
        petNomeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      throw new Error('Campos pendentes');
    }

    setErros({});

    const primeiroServico = cart.find(isServicoItem) || cart[0];
    const googleCalUrl = buildPetAgendamentoCalendarUrl({
      servicoNome: temServicos
        ? (cart.map((i) => i.produto.nome).join(' + ') || 'Atendimento / Agendamento')
        : `Pedido: ${cart.map((i) => `${i.quantidade}x ${i.produto.nome}`).join(', ')}`,
      petNome: temServicos ? (petNome.trim() || 'Pet') : 'Pedido Produtos',
      petEspecie,
      petPorte,
      petObs: petObs.trim(),
      tutorNome: clienteNome.trim() || 'Tutor / Cliente',
      tutorTelefone: clienteTelefone.trim() || '',
      dataAgendada: dataAgendamento,
      horario: horarioAgendamento,
      modalidade: opcaoEntrega === 'entrega' ? 'Entrega em Domicílio' : 'Retirada na Loja',
      endereco: opcaoEntrega === 'entrega' ? enderecoEntrega.trim() : (empresa.endereco || ''),
      empresaNome: empresa.nome || 'Estabelecimento',
      ownerEmail: empresa.emailGoogleAgenda || empresa.email || '',
      valorTotal: totalGeral,
    });

    if (activeSlug) {
      await adicionarAgendamento(activeSlug, {
        dataAgendada: dataAgendamento,
        horario: horarioAgendamento,
        servicoId: primeiroServico ? primeiroServico.produto.id : 'item-01',
        servicoNome: temServicos
          ? cart.map((i) => i.produto.nome).join(' + ')
          : `Pedido: ${cart.map((i) => `${i.quantidade}x ${i.produto.nome}`).join(', ')}`,
        preco: totalGeral,
        pet: {
          nome: temServicos ? (petNome.trim() || 'Pet') : 'Pedido Produtos',
          especie: petEspecie,
          porte: petPorte.includes('Pequeno') ? 'pequeno' : petPorte.includes('Grande') ? 'grande' : 'medio',
          observacoes: petObs.trim() || undefined,
        },
        tutor: {
          nome: clienteNome.trim() || 'Cliente',
          whatsapp: clienteTelefone.trim() || '',
        },
        status: 'confirmado',
        googleCalendarUrl: googleCalUrl || undefined,
        observacoes: [
          opcaoEntrega === 'entrega' ? `🛵 Entrega: ${enderecoEntrega}` : `🏪 Retirada na Loja`,
          observacoesGerais.trim(),
        ]
          .filter(Boolean)
          .join(' | '),
      });
    }

    setAgendamentoConfirmado(true);
    toast.success('🎉 Agendamento confirmado com sucesso na agenda da loja!');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end">
      <div className="bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250 border-l border-[#E0E0E0] dark:border-[#333333] transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between bg-[#F5F7FB] dark:bg-[#2C2C2C]/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{isAgendamentoNiche ? '📅' : '🛒'}</span>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-[#212529] dark:text-[#FFFFFF]">
                {temServicos ? `Seu Agendamento (${cart.length})` : `Seu Pedido (${cart.length})`}
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                <Calendar className="w-3 h-3 text-teal-700 dark:text-white" />
                {temServicos
                  ? 'Atendimento com Horário Marcado'
                  : opcaoEntrega === 'entrega'
                  ? 'Entrega Agendada (+1h)'
                  : 'Retirada Agendada'}
              </span>
            </div>
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
              <p className="text-xs">Adicione produtos ou serviços do catálogo para continuar.</p>
            </div>
          ) : (
            <>
              {/* Item Rows */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const isServ = isServicoItem(item);
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border space-y-2.5 shadow-2xs transition-all ${
                        isServ
                          ? 'border-teal-200 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20'
                          : 'border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm text-[#212529] dark:text-[#FFFFFF]">
                              {item.produto.nome}
                            </h4>
                            {isServ && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-1.5 py-0.5 rounded">
                                ✂️ Serviço
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[#6C757D] dark:text-[#B0BEC5]">
                            R$ {(Number(item.produto.preco) + (item.acrescimo || 0)).toFixed(2).replace('.', ',')} cada
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Combinações e Opcionais Selecionados */}
                      {item.opcoesDetalhe && item.opcoesDetalhe.length > 0 ? (
                        <div className="space-y-1.5 bg-white dark:bg-[#1E1E1E] p-2.5 rounded-xl border border-teal-100 dark:border-teal-900/40">
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-300" />
                            Combinações & Adicionais Escolhidos:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.opcoesDetalhe.map((g, gi) => (
                              <span
                                key={gi}
                                className="bg-[#EDF2F7] dark:bg-[#2C2C2C] text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-[#383838]"
                              >
                                <span className="opacity-75">{g.grupo}:</span>{' '}
                                {g.itens
                                  .map((i) => `${i.nome}${i.preco > 0 ? ` (+R$ ${i.preco.toFixed(2).replace('.', ',')})` : ''}`)
                                  .join(', ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        item.produto.opcoes && item.produto.opcoes.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                              Combinações padrão aplicadas. Deseja personalizar?
                            </span>
                            {onOpenProductModal && (
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenProductModal(item.produto);
                                  onClose();
                                }}
                                className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer whitespace-nowrap"
                              >
                                Personalizar →
                              </button>
                            )}
                          </div>
                        )
                      )}

                      {item.observacoes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#2C2C2C] px-2.5 py-1 rounded-lg italic">
                          Obs: {item.observacoes}
                        </p>
                      )}

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#E0E0E0] dark:border-[#333333]">
                        <div className="flex items-center gap-2 bg-[#EDF2F7] dark:bg-[#2C2C2C] px-2 py-1 rounded-lg">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="w-6 h-6 rounded bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] font-bold text-xs shadow-2xs flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs px-1 text-[#212529] dark:text-[#FFFFFF]">
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="w-6 h-6 rounded bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] font-bold text-xs shadow-2xs flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-extrabold text-sm text-[#212529] dark:text-[#FFFFFF]">
                          R${' '}
                          {((Number(item.produto.preco) + (item.acrescimo || 0)) * item.quantidade)
                            .toFixed(2)
                            .replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* GATEKEEPER DE IDENTIFICAÇÃO DO TUTOR */}
              {!isAuthenticated ? (
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                        Cadastro de Tutor Obrigatório
                      </h4>
                      <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed font-medium">
                        Para concluir o agendamento do seu pet e salvar o histórico de atendimento, você precisa estar logado ou cadastrado.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="py-2.5 px-3 rounded-xl border border-amber-300 dark:border-amber-700 font-extrabold text-xs text-amber-900 dark:text-amber-100 bg-white dark:bg-[#1E1E1E] hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-all text-center cursor-pointer shadow-xs active:scale-98"
                    >
                      Já tenho conta
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="py-2.5 px-3 rounded-xl font-extrabold text-xs text-white bg-teal-700 hover:bg-teal-600 transition-all text-center cursor-pointer shadow-xs active:scale-98"
                    >
                      Cadastrar Tutor & Pets
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        {customer?.name ? customer.name.slice(0, 2).toUpperCase() : <UserCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-teal-950 dark:text-teal-100">
                            {customer?.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full bg-teal-200 dark:bg-teal-900/70 text-teal-900 dark:text-teal-200 text-[10px] font-black">
                            Tutor Identificado
                          </span>
                        </div>
                        <span className="text-[11px] text-teal-800/80 dark:text-teal-300/80 font-medium">
                          {customer?.email} {customer?.phone ? `• ${customer.phone}` : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={logout}
                      title="Trocar de conta ou deslogar"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  {customer?.hasTransportBox !== undefined && (
                    <div className="text-[11px] text-teal-800 dark:text-teal-300 flex items-center gap-1.5 font-medium pt-1.5 border-t border-teal-200/60 dark:border-teal-900/50">
                      <PackageCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Caixa de transporte para locomoção: <strong>{customer.hasTransportBox ? 'Sim (possui)' : 'Não possui'}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* 1. OPÇÃO DE RETIRADA NA LOJA OU ENTREGA (ANTES DO AGENDAMENTO) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#333] space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span>Como deseja receber o pedido? *</span>
                  </label>
                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                    {opcaoEntrega === 'entrega' ? '🛵 Entrega em Domicílio' : '🏪 Retirada na Loja'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpcaoEntrega('retirada');
                      if (erros.enderecoEntrega) setErros((prev) => ({ ...prev, enderecoEntrega: undefined }));
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                      opcaoEntrega === 'retirada'
                        ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-[#252D3D] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                    }`}
                  >
                    <span>🏪 Retirada na Loja</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpcaoEntrega('entrega')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                      opcaoEntrega === 'entrega'
                        ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-[#252D3D] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                    }`}
                  >
                    <span>🛵 Entrega em Domicílio</span>
                  </button>
                </div>

                {/* Se for Retirada: Mostra endereço da loja */}
                {opcaoEntrega === 'retirada' && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161E2E] border border-slate-200 dark:border-[#283449] text-xs space-y-1">
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      Local para Retirada no Balcão:
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {empresa.endereco || 'Endereço da loja a confirmar via WhatsApp após o pedido.'}
                    </p>
                  </div>
                )}

                {/* Se for Entrega: Campo de Endereço Completo */}
                {opcaoEntrega === 'entrega' && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Endereço Completo para Entrega *</span>
                      </label>
                      {erros.enderecoEntrega && (
                        <span className="text-[11px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          <span>{erros.enderecoEntrega}</span>
                        </span>
                      )}
                    </div>
                    <input
                      ref={enderecoRef}
                      type="text"
                      required
                      value={enderecoEntrega}
                      onChange={(e) => {
                        setEnderecoEntrega(e.target.value);
                        if (erros.enderecoEntrega) setErros((prev) => ({ ...prev, enderecoEntrega: undefined }));
                      }}
                      placeholder="Rua, número, bairro, complemento / ponto de referência..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#1E1E1E] text-xs text-slate-900 dark:text-white outline-none transition-all ${
                        erros.enderecoEntrega
                          ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                          : 'border-slate-200 dark:border-[#333] focus:border-teal-600'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* 2. BLOCO DE AGENDAMENTO (HORÁRIO COM 1H A MAIS SE FOR ENTREGA HOJE) */}
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                      {opcaoEntrega === 'entrega'
                        ? 'Agendamento da Entrega'
                        : 'Agendamento da Retirada na Loja'}
                    </h4>
                    <p className="text-[11px] text-teal-800 dark:text-teal-300 font-medium">
                      {opcaoEntrega === 'entrega'
                        ? 'Defina o dia e horário estimado para receber seu pedido'
                        : 'Defina o dia e horário que irá passar para retirar seu pedido'}
                    </p>
                  </div>
                </div>

                {/* Aviso informativo de 1h de antecedência para entrega */}
                {opcaoEntrega === 'entrega' && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-100/60 dark:bg-teal-900/50 border border-teal-300 dark:border-teal-700/80 text-teal-900 dark:text-teal-100 text-[11px] font-semibold leading-relaxed">
                    <Clock className="w-4 h-4 text-teal-700 dark:text-teal-300 shrink-0" />
                    <span>
                      Para entregas hoje, os horários iniciam com <strong>1h a mais do horário atual</strong> para dar tempo da separação e entrega serem feitas.
                    </span>
                  </div>
                )}

                {/* Seleção de Data */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-white" />
                      {opcaoEntrega === 'entrega' ? 'Data da Entrega *' : 'Data da Retirada *'}
                    </span>
                    {dataAgendamento && (
                      <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
                        {dataAgendamento.split('-').reverse().join('/')}
                      </span>
                    )}
                  </label>

                  {/* Pílulas de datas rápidas */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {proximosDias.map((d) => (
                      <button
                        key={d.iso}
                        type="button"
                        onClick={() => setDataAgendamento(d.iso)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex-shrink-0 ${
                          dataAgendamento === d.iso
                            ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                            : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-[#333] text-slate-700 dark:text-slate-300 hover:border-teal-400'
                        }`}
                      >
                        {d.label} ({d.diaMes})
                      </button>
                    ))}
                  </div>

                  <input
                    type="date"
                    required
                    value={dataAgendamento}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDataAgendamento(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1E1E1E] text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                {/* Seleção de Horário */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-700 dark:text-white" />
                      <span>{opcaoEntrega === 'entrega' ? 'Horário de Entrega Disponível *' : 'Horário de Retirada Disponível *'}</span>
                    </label>
                    {dataAgendamento === getTodayStr(0) && opcaoEntrega === 'entrega' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                        +1h do Horário Atual
                      </span>
                    )}
                  </div>

                  {horariosValidos.length === 0 ? (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Horários para entrega hoje encerrados</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Para entrega hoje com no mínimo 1 hora de antecedência, os horários já se encerraram. Deseja agendar para amanhã?
                      </p>
                      <button
                        type="button"
                        onClick={() => setDataAgendamento(getTodayStr(1))}
                        className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs transition-all cursor-pointer"
                      >
                        Agendar para Amanhã ({proximosDias[1]?.diaMes})
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {horariosValidos.map((hr) => (
                        <button
                          key={hr}
                          type="button"
                          onClick={() => setHorarioAgendamento(hr)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer text-center ${
                            horarioAgendamento === hr
                              ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                              : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-[#333] text-slate-700 dark:text-slate-300 hover:border-teal-400'
                          }`}
                        >
                          {hr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dados do Pet: APENAS SE HOUVER SERVIÇOS NO CARRINHO */}
                {temServicos && (
                  <div className="pt-3 border-t border-teal-200 dark:border-teal-800/60 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5" />
                      Dados do Pet para o Serviço:
                    </span>

                    {/* SE O CLIENTE TEM PETS CADASTRADOS, EXIBE SELETOR VISUAL */}
                    {isAuthenticated && customer?.pets && customer.pets.length > 0 ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            <span>Qual pet receberá este atendimento? *</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => openAuthModal('register')}
                            className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Novo Pet</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {customer.pets.map((pet) => {
                            const isSelected = selectedPetId === pet.id;
                            const emoji = pet.species === 'gato' ? '🐱' : pet.species === 'ave' ? '🦜' : '🐶';
                            return (
                              <button
                                key={pet.id}
                                type="button"
                                onClick={() => setSelectedPetId(pet.id)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 active:scale-98 ${
                                  isSelected
                                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 ring-2 ring-teal-600/30 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E1E1E] hover:border-teal-400'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{emoji}</span>
                                  <div>
                                    <p className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                                      {pet.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                      {pet.breed || (pet.species === 'gato' ? 'Felino' : 'Canino')}
                                    </p>
                                  </div>
                                </div>

                                {isSelected && (
                                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {selectedPet && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161E2E] border border-slate-200 dark:border-[#283449] text-[11px] space-y-1">
                            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                              <span>Pet Selecionado: <strong>{selectedPet.name}</strong></span>
                              {selectedPet.hasTransportBox !== undefined && (
                                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400">
                                  Caixa de transporte: {selectedPet.hasTransportBox ? 'Sim' : 'Não'}
                                </span>
                              )}
                            </div>
                            {selectedPet.specialCare ? (
                              <p className="text-amber-800 dark:text-amber-300 font-medium">
                                ⚠️ <strong>Cuidados:</strong> {selectedPet.specialCare}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5 text-rose-500" />
                                <span>Nome do Pet *</span>
                              </label>
                              {erros.petNome && (
                                <span className="text-[11px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                  <AlertCircle className="w-3 h-3 text-rose-500 flex-shrink-0" />
                                  <span>{erros.petNome}</span>
                                </span>
                              )}
                            </div>
                            <input
                              ref={petNomeRef}
                              type="text"
                              required
                              value={petNome}
                              onChange={(e) => {
                                setPetNome(e.target.value);
                                if (erros.petNome) setErros((prev) => ({ ...prev, petNome: undefined }));
                              }}
                              placeholder="Ex: Thor, Mel, Bob..."
                              className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-[#1E1E1E] text-xs text-slate-900 dark:text-white outline-none transition-all ${
                                erros.petNome
                                  ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                                  : 'border-slate-200 dark:border-[#333] focus:border-teal-600'
                              }`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Porte / Espécie
                            </label>
                            <Select
                              value={petPorte}
                              onChange={(v) => {
                                const val = String(v);
                                setPetPorte(val);
                                if (val.includes('Felino') || val.includes('Gato')) {
                                  setPetEspecie('gato');
                                } else {
                                  setPetEspecie('cao');
                                }
                              }}
                              options={[
                                { value: 'Pequeno (até 10kg)', label: '🐶 Porte Pequeno (até 10kg)' },
                                { value: 'Médio (11 a 20kg)', label: '🐶 Porte Médio (11 a 20kg)' },
                                { value: 'Grande (acima de 20kg)', label: '🐶 Porte Grande (acima de 20kg)' },
                                { value: 'Felino / Gato', label: '🐱 Felino / Gato' },
                                { value: 'Outro Pet', label: '🐾 Outro Pet' },
                              ]}
                              buttonClassName="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#333] text-xs bg-white dark:bg-[#1E1E1E]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Observações / Cuidados com o Pet (Opcional)
                          </label>
                          <input
                            type="text"
                            value={petObs}
                            onChange={(e) => setPetObs(e.target.value)}
                            placeholder="Ex: Medo de secador alto, alérgico a perfume..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1E1E1E] text-xs text-slate-900 dark:text-white outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Informações Gerais do Cliente / Contato */}
              <div className="pt-4 border-t border-[#E0E0E0] dark:border-[#333333] space-y-4">
                <h3 className="font-bold text-xs text-[#6C757D] dark:text-[#B0BEC5] uppercase tracking-wider">
                  Dados para Contato & Pagamento
                </h3>

                {/* Nome */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>Seu Nome *</span>
                    </label>
                    {erros.clienteNome && (
                      <span className="text-[11px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-3 h-3 text-rose-500 flex-shrink-0" />
                        <span>{erros.clienteNome}</span>
                      </span>
                    )}
                  </div>
                  <input
                    ref={clienteNomeRef}
                    type="text"
                    required
                    value={clienteNome}
                    onChange={(e) => {
                      setClienteNome(e.target.value);
                      if (erros.clienteNome) setErros((prev) => ({ ...prev, clienteNome: undefined }));
                    }}
                    placeholder="Ex: João Silva"
                    className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-[#1E1E1E] text-xs text-[#212529] dark:text-[#FFFFFF] outline-none transition-all ${
                      erros.clienteNome
                        ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                        : 'border-[#E0E0E0] dark:border-[#333333] focus:border-teal-600'
                    }`}
                  />
                </div>

                {/* Telefone / WhatsApp */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp para Contato / Confirmação</span>
                  </label>
                  <input
                    type="tel"
                    value={clienteTelefone}
                    onChange={(e) => setClienteTelefone(e.target.value)}
                    placeholder="(11) 99876-5432"
                    className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-xs text-[#212529] dark:text-[#FFFFFF] outline-none"
                  />
                </div>

                {/* Forma de Pagamento */}
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
                    <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">
                      Troco para quanto?
                    </label>
                    <input
                      type="text"
                      value={trocoPara}
                      onChange={(e) => setTrocoPara(e.target.value)}
                      placeholder="Ex: R$ 50,00 ou Não preciso de troco"
                      className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-xs text-[#212529] dark:text-[#FFFFFF] outline-none"
                    />
                  </div>
                )}

                {/* Observações Gerais */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">
                    {isAgendamentoNiche ? 'Observações do Atendimento:' : 'Observações Gerais do Pedido:'}
                  </label>
                  <textarea
                    rows={2}
                    value={observacoesGerais}
                    onChange={(e) => setObservacoesGerais(e.target.value)}
                    placeholder="Instruções adicionais, ponto de referência..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-xs text-[#212529] dark:text-[#FFFFFF] outline-none resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer with Total & Send to WhatsApp */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-[#E0E0E0] dark:border-[#333333] bg-[#F5F7FB] dark:bg-[#2C2C2C]/50 space-y-3 flex-shrink-0">
            {agendamentoConfirmado && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 space-y-1 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Agendamento Confirmado no Sistema!</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Horário reservado para <strong>{dataAgendamento.split('-').reverse().join('/')}</strong> às <strong>{horarioAgendamento}</strong>. Todos os dados continuam preenchidos para envio de comprovante no WhatsApp.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-base font-extrabold text-[#212529] dark:text-[#FFFFFF]">
              <span>{isAgendamentoNiche ? 'Total do Agendamento:' : 'Total do Pedido:'}</span>
              <span className="text-teal-700 dark:text-teal-400">
                R$ {totalGeral.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <button
              onClick={handleSendWhatsApp}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 bg-teal-700 hover:bg-teal-600 text-white"
            >
              <Send className="w-4 h-4" />
              <span>{isAgendamentoNiche ? 'Enviar Agendamento no WhatsApp' : 'Enviar Pedido pelo WhatsApp'}</span>
            </button>

            {isAgendamentoNiche && (
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.warning('Faça login ou cadastre-se para acessar a Google Agenda.');
                    openAuthModal('register');
                    return;
                  }
                  setIsCalendarModalOpen(true);
                }}
                className={`w-full py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs text-center ${
                  agendamentoConfirmado
                    ? 'border-emerald-600/30 text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                    : 'border-teal-600/30 text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40'
                }`}
              >
                {agendamentoConfirmado ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                )}
                <span>
                  {agendamentoConfirmado
                    ? 'Agendamento Confirmado na Agenda (Ver Parâmetros)'
                    : 'Salvar no Google Agenda (1-Clique)'}
                </span>
                {!agendamentoConfirmado && (
                  <Sparkles className="w-3.5 h-3.5 opacity-70 text-teal-600 dark:text-teal-400" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal In-App com Parâmetros do Google Agenda */}
      {isCalendarModalOpen && (
        <GoogleAgendaModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          onConfirm={handleConfirmarAgendamentoModal}
          initialData={calendarModalData}
        />
      )}
    </div>
  );
};
