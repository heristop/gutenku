export interface IGutenbergClient {
  fetchBook(gutenbergId: number): Promise<string>;
  isAvailable(gutenbergId: number): Promise<boolean>;
}

export const IGutenbergClientToken = 'IGutenbergClient';
