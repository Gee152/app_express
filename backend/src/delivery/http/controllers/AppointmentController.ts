import { Request, Response } from 'express';
import { TypeOrmAppointmentRepository } from '../../../infrastructure/database/typeorm/repositories/TypeOrmAppointmentRepository.js';
import { Appointment, AppointmentStatus } from '../../../infrastructure/database/typeorm/entities/Appointment.js';

export class AppointmentController {
  private appointmentRepo = new TypeOrmAppointmentRepository();

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const {
        id,
        customerId,
        scheduledDate,
        scheduledTime,
        serviceId,
        serviceName,
        price,
        pet,
        tutor,
        status,
        notes,
        deliveryType,
        deliveryAddress,
        googleCalendarUrl,
      } = req.body;

      if (!slug) {
        res.status(400).json({ error: 'Slug da loja é obrigatório' });
        return;
      }

      if (!scheduledDate || !scheduledTime) {
        res.status(400).json({ error: 'Data e horário do agendamento são obrigatórios' });
        return;
      }

      if (!tutor?.nome || !tutor?.whatsapp) {
        res.status(400).json({ error: 'Dados do tutor (nome e WhatsApp) são obrigatórios' });
        return;
      }

      const appointment = new Appointment({
        id,
        storeSlug: slug,
        customerId,
        scheduledDate,
        scheduledTime,
        serviceId: serviceId || 'srv-default',
        serviceName: serviceName || 'Atendimento / Agendamento',
        price: Number(price) || 0,
        pet: pet || { nome: 'Pet' },
        tutor: {
          nome: tutor.nome,
          whatsapp: tutor.whatsapp,
          email: tutor.email,
        },
        status: (status as AppointmentStatus) || 'solicitado',
        notes,
        deliveryType: deliveryType || 'retirada',
        deliveryAddress,
        googleCalendarUrl,
      });

      const saved = await this.appointmentRepo.create(appointment);
      res.status(201).json(saved);
    } catch (err: any) {
      console.error('[AppointmentController] Erro ao criar agendamento:', err);
      res.status(500).json({ error: err?.message || 'Erro interno ao criar agendamento' });
    }
  };

  public list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const { status } = req.query;

      if (!slug) {
        res.status(400).json({ error: 'Slug da loja é obrigatório' });
        return;
      }

      const appointments = await this.appointmentRepo.listByStoreSlug(
        slug,
        status ? (String(status) as AppointmentStatus) : undefined
      );

      res.status(200).json(appointments);
    } catch (err: any) {
      console.error('[AppointmentController] Erro ao listar agendamentos:', err);
      res.status(500).json({ error: err?.message || 'Erro interno ao listar agendamentos' });
    }
  };

  public updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || !status) {
        res.status(400).json({ error: 'ID e status são obrigatórios' });
        return;
      }

      const validStatuses: AppointmentStatus[] = ['solicitado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado'];
      if (!validStatuses.includes(status as AppointmentStatus)) {
        res.status(400).json({ error: `Status inválido. Permitidos: ${validStatuses.join(', ')}` });
        return;
      }

      const ok = await this.appointmentRepo.updateStatus(id, status as AppointmentStatus);
      if (!ok) {
        res.status(404).json({ error: 'Agendamento não encontrado' });
        return;
      }

      res.status(200).json({ message: 'Status atualizado com sucesso', status });
    } catch (err: any) {
      console.error('[AppointmentController] Erro ao atualizar status:', err);
      res.status(500).json({ error: err?.message || 'Erro interno ao atualizar status' });
    }
  };
}
