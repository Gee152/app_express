import cron, { ScheduledTask } from 'node-cron';
import { TypeOrmAppointmentRepository } from '../database/typeorm/repositories/TypeOrmAppointmentRepository.js';
import { TypeOrmStoreRepository } from '../database/typeorm/repositories/TypeOrmStoreRepository.js';
import { getWhatsAppProvider } from '../providers/whatsapp/WhatsAppProviderFactory.js';
import { Appointment } from '../database/typeorm/entities/Appointment.js';

let scheduledCronTask: ScheduledTask | null = null;

export async function runAppointmentReminderCheck(): Promise<number> {
  const appointmentRepo = new TypeOrmAppointmentRepository();
  const storeRepo = new TypeOrmStoreRepository();
  const whatsapp = getWhatsAppProvider();

  const now = Date.now();
  // Janela de alerta: entre 50 e 70 minutos a partir de agora (~1 hora de antecedência)
  const minTime = new Date(now + 50 * 60 * 1000);
  const maxTime = new Date(now + 70 * 60 * 1000);

  console.log(`[AppointmentReminderCron] Verificando agendamentos entre ${minTime.toLocaleTimeString()} e ${maxTime.toLocaleTimeString()}...`);

  const pending = await appointmentRepo.findPendingReminders(minTime, maxTime);

  if (pending.length === 0) {
    return 0;
  }

  console.log(`[AppointmentReminderCron] ${pending.length} agendamento(s) com lembrete pendente encontrado(s).`);

  let dispatchedCount = 0;

  for (const appointment of pending) {
    try {
      const store = await storeRepo.findBySlug(appointment.storeSlug);
      const storeName = store?.name || 'Pet Shop';
      const storePhone = store?.whatsapp || '';

      // 1. Mensagem amigável para o Tutor / Cliente
      const emojiPet = appointment.pet.especie === 'gato' ? '🐱 Gato' : appointment.pet.especie === 'ave' ? '🦜 Ave' : '🐶 Cão';
      const msgTutor =
        `⏰ *Lembrete de Atendimento - ${storeName}*\n\n` +
        `Olá, *${appointment.tutor.nome}*! Passando para lembrar que falta apenas *1 hora* para o horário do seu pet *${appointment.pet.nome}*!\n\n` +
        `🐾 *Pet:* ${appointment.pet.nome} (${emojiPet}${appointment.pet.raca ? ` · ${appointment.pet.raca}` : ''})\n` +
        `✂️ *Serviço:* ${appointment.serviceName}\n` +
        `🕒 *Horário Previsto:* Hoje às *${appointment.scheduledTime}*\n` +
        `📍 *Modalidade:* ${appointment.deliveryType === 'entrega' ? '🛵 Entrega em Domicílio' : '🏪 Atendimento na Loja / Balcão'}\n` +
        (appointment.deliveryAddress ? `🏠 *Endereço:* ${appointment.deliveryAddress}\n` : '') +
        (appointment.pet.hasTransportBox ? `📦 *Aviso de Segurança:* Por favor, traga a caixa de transporte do seu pet.\n` : '') +
        `\nQualquer dúvida ou imprevisto, responda diretamente a esta mensagem! Estamos te esperando!`;

      await whatsapp.sendMessage({
        toPhone: appointment.tutor.whatsapp,
        message: msgTutor,
      });

      // 2. Mensagem para o Dono da Loja / Lojista (se telefone estiver cadastrado)
      if (storePhone) {
        const msgDono =
          `🔔 *Alerta de Atendimento em 1 Hora! - ${storeName}*\n\n` +
          `👤 *Tutor:* ${appointment.tutor.nome} (WhatsApp: ${appointment.tutor.whatsapp})\n` +
          `🐾 *Pet:* ${appointment.pet.nome} (${emojiPet} · ${appointment.pet.porte || 'Médio'}${appointment.pet.raca ? ` · ${appointment.pet.raca}` : ''})\n` +
          `✂️ *Serviço:* ${appointment.serviceName}\n` +
          `🕒 *Horário Marcado:* *${appointment.scheduledTime}*\n` +
          (appointment.pet.cuidadosEspeciais ? `⚠️ *Cuidados do Pet:* ${appointment.pet.cuidadosEspeciais}\n` : '') +
          `🛵 *Modalidade:* ${appointment.deliveryType === 'entrega' ? `Entrega em: ${appointment.deliveryAddress || 'Endereço cliente'}` : 'Retirada no Balcão'}\n` +
          `💰 *Valor:* R$ ${Number(appointment.price).toFixed(2).replace('.', ',')}`;

        await whatsapp.sendMessage({
          toPhone: storePhone,
          message: msgDono,
        });
      }

      // 3. Marca como notificado (Idempotência Estrita)
      appointment.reminderSent = true;
      appointment.reminderSentAt = new Date();
      await appointmentRepo.update(appointment);

      dispatchedCount++;
      console.log(`[AppointmentReminderCron] Lembrete disparado com sucesso para agendamento ${appointment.id} (${appointment.tutor.nome})`);
    } catch (itemErr) {
      console.error(`[AppointmentReminderCron] Erro ao enviar lembrete para agendamento ${appointment.id}:`, itemErr);
    }
  }

  return dispatchedCount;
}

export function startAppointmentReminderCron(): ScheduledTask {
  if (scheduledCronTask) {
    return scheduledCronTask;
  }

  console.log('[AppointmentReminderCron] Inicializando cronjob de lembretes (a cada 5 minutos)...');

  // Executa a cada 5 minutos: */5 * * * *
  scheduledCronTask = cron.schedule('*/5 * * * *', async () => {
    try {
      await runAppointmentReminderCheck();
    } catch (err) {
      console.error('[AppointmentReminderCron] Erro ao rodar ciclo do cron:', err);
    }
  });

  return scheduledCronTask;
}

export function stopAppointmentReminderCron(): void {
  if (scheduledCronTask) {
    scheduledCronTask.stop();
    scheduledCronTask = null;
    console.log('[AppointmentReminderCron] Cronjob de lembretes interrompido.');
  }
}
