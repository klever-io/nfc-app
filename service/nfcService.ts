// service/nfcService.ts

export async function simulateNfcService(): Promise<{ success: boolean }> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true });
    }, 4000);
  });
}
