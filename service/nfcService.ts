// Simula leitura de cartão para recarga
export async function readCardForRecharge(): Promise<{ cardId: string }> {
  return new Promise(resolve => {
    setTimeout(() => {
      // Simula leitura e retorna um id de cartão
      resolve({ cardId: 'CARD-123456' });
    }, 2000);
  });
}
// service/nfcService.ts

export async function simulateNfcService(selectedId?: string): Promise<{ success: boolean; error?: string }> {
  return new Promise(resolve => {
    setTimeout(() => {
      if (selectedId === '3') {
        resolve({ success: false, error: 'Falha na comunicação com o serviço NFC para Coffee.' });
      } else {
        resolve({ success: true });
      }
    }, 4000);
  });
}
