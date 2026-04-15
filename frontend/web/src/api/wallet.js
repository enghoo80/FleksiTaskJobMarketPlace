import api from './client'

export const walletApi = {
  getWallet: () => api.get('/wallet'),
  getTransactions: () => api.get('/wallet/transactions'),
  getBankAccount: () => api.get('/wallet/bank-account'),
  upsertBankAccount: (data) => api.put('/wallet/bank-account', data),
  getWithdrawals: () => api.get('/wallet/withdrawals'),
  requestWithdrawal: (amount) => api.post('/wallet/withdraw', { amount }),
}
