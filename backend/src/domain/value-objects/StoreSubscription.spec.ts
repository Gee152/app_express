import { StoreSubscription, PLAN_DAYS } from './StoreSubscription.js';

describe('Value Object: StoreSubscription', () => {
  it('should initialize with default values when empty', () => {
    const sub = new StoreSubscription();
    expect(sub.planType).toBe('mensal');
    expect(sub.planDays).toBe(30);
    expect(sub.isPaid).toBe(false);
    expect(sub.paidAt).toBeNull();
    expect(sub.expiresAt).toBeNull();

    const status = sub.calculateStatus();
    expect(status.status).toBe('pendente-pagamento');
    expect(status.isPaid).toBe(false);
    expect(status.isActive).toBe(false);
    expect(status.daysRemaining).toBe(30);
  });

  it('should correctly set plan duration for all 4 plans (mensal, trimestral, semestral, anual)', () => {
    expect(PLAN_DAYS.mensal).toBe(30);
    expect(PLAN_DAYS.trimestral).toBe(90);
    expect(PLAN_DAYS.semestral).toBe(180);
    expect(PLAN_DAYS.anual).toBe(365);

    const sub = new StoreSubscription({ planType: 'anual' });
    expect(sub.planDays).toBe(365);

    sub.changePlan('trimestral');
    expect(sub.planType).toBe('trimestral');
    expect(sub.planDays).toBe(90);
  });

  it('should calculate active status and expiration when paid', () => {
    const sub = new StoreSubscription({ planType: 'trimestral' });
    const now = new Date('2026-09-04T12:00:00Z');

    sub.activatePayment(now);

    expect(sub.isPaid).toBe(true);
    expect(sub.paidAt).toEqual(now);
    expect(sub.expiresAt).toBeDefined();

    // 90 dias após 2026-09-04
    const status = sub.calculateStatus(now);
    expect(status.status).toBe('ativo');
    expect(status.isPaid).toBe(true);
    expect(status.isActive).toBe(true);
    expect(status.daysRemaining).toBe(90);
    expect(status.isExpired).toBe(false);
  });

  it('should calculate expiring soon status when 5 or fewer days remain', () => {
    const sub = new StoreSubscription({ planType: 'mensal' });
    const paidAt = new Date('2026-08-01T00:00:00Z');
    sub.activatePayment(paidAt);

    // 27 dias depois (faltam 3 dias para 30 dias)
    const checkDate = new Date(paidAt.getTime() + 27 * 86_400_000);
    const status = sub.calculateStatus(checkDate);

    expect(status.status).toBe('expirando');
    expect(status.daysRemaining).toBe(3);
    expect(status.isExpiringSoon).toBe(true);
    expect(status.isExpired).toBe(false);
  });

  it('should calculate expired status when days remaining is negative', () => {
    const sub = new StoreSubscription({ planType: 'mensal' });
    const paidAt = new Date('2026-08-01T00:00:00Z');
    sub.activatePayment(paidAt);

    // 35 dias depois (já venceu há 5 dias)
    const checkDate = new Date(paidAt.getTime() + 35 * 86_400_000);
    const status = sub.calculateStatus(checkDate);

    expect(status.status).toBe('vencido');
    expect(status.isExpired).toBe(true);
    expect(status.isActive).toBe(false);
  });

  it('should deactivate payment cleanly', () => {
    const sub = new StoreSubscription({ planType: 'semestral' });
    sub.activatePayment();
    expect(sub.isPaid).toBe(true);

    sub.deactivatePayment();
    expect(sub.isPaid).toBe(false);
    expect(sub.paidAt).toBeNull();
    expect(sub.expiresAt).toBeNull();

    const status = sub.calculateStatus();
    expect(status.status).toBe('pendente-pagamento');
  });
});
