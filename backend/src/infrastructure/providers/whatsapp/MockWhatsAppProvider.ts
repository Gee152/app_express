import { IWhatsAppProvider, SendWhatsAppMessageOptions, WhatsAppSendResult } from './IWhatsAppProvider.js';

export class MockWhatsAppProvider implements IWhatsAppProvider {
  public async sendMessage(options: SendWhatsAppMessageOptions): Promise<WhatsAppSendResult> {
    const cleanPhone = options.toPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const fakeId = `mock_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`\n================== [MOCK WHATSAPP DISPATCH] ==================`);
    console.log(`Destinatário: +${formattedPhone} (Instância: ${options.instanceName || 'default'})`);
    console.log(`ID Simulado: ${fakeId}`);
    console.log(`Mensagem:\n${options.message}`);
    console.log(`==============================================================\n`);

    return {
      success: true,
      messageId: fakeId,
    };
  }
}
