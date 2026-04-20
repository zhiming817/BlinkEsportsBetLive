import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { useMutation } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { useGetBalanceInvalidate } from './use-get-balance'

export function useRequestAirdrop({ address }: { address: PublicKey }) {
  const { connection } = useMobileWallet()
  const invalidateBalance = useGetBalanceInvalidate({ address })

  return useMutation({
    mutationKey: ['airdrop', { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (amount: number = 1) => {
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(address, amount * LAMPORTS_PER_SOL),
      ])

      let confirmed = false
      const start = Date.now()
      const timeout = 60000 // 60 seconds timeout

      while (!confirmed && Date.now() - start < timeout) {
        const { value } = await connection.getSignatureStatus(signature)
        if (value?.confirmationStatus === 'confirmed' || value?.confirmationStatus === 'finalized') {
          confirmed = true
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      if (!confirmed) {
        throw new Error('Airdrop confirmation timeout')
      }

      return signature
    },
    onSuccess: async () => {
      await invalidateBalance()
    },
    retry: false,
  })
}
