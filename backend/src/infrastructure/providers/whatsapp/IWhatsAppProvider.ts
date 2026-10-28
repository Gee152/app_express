export interface SendWhatsAppMessageOptions {
  toPhone: string;
  message: string;
  instanceName?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IWhatsAppProvider {
  sendMessage(options: SendWhatsAppMessageOptions): Promise<WhatsAppSendResult>;
}
