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
