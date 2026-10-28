import { IWhatsAppProvider, SendWhatsAppMessageOptions, WhatsAppSendResult } from './IWhatsAppProvider.js';

export class EvolutionApiProvider implements IWhatsAppProvider {
  constructor(
    private readonly apiUrl: string,
    private readonly apiKey: string,
    private readonly defaultInstance: string
  ) {}

  public async sendMessage(options: SendWhatsAppMessageOptions): Promise<WhatsAppSendResult> {
    try {
      const cleanPhone = options.toPhone.replace(/\D/g, '');
      if (!cleanPhone) {
        return { success: false, error: 'Telefone inválido ou vazio' };
      }

      const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      const instance = options.instanceName || this.defaultInstance;
      const endpoint = `${this.apiUrl.replace(/\/$/, '')}/message/sendText/${instance}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: options.message,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[EvolutionApiProvider] Falha ao enviar para ${formattedPhone}: HTTP ${response.status} - ${errText}`);
        return { success: false, error: `HTTP ${response.status}: ${errText}` };
      }

      const data = (await response.json()) as any;
      const messageId = data?.key?.id || data?.id || undefined;
      return { success: true, messageId };
    } catch (err: any) {
      console.error(`[EvolutionApiProvider] Erro de rede ou requisição:`, err?.message || err);
      return { success: false, error: err?.message || 'Falha ao conectar com Evolution API' };
    }
  }
}
