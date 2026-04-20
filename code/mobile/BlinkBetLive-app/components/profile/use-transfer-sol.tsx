import { createTransaction } from '@/components/profile/create-transaction'
import { PublicKey, TransactionSignature } from '@solana/web3.js'
import { useMutation } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { useGetBalanceInvalidate } from './use-get-balance'

export function useTransferSol({ address }: { address: PublicKey }) {
  const { connection, signAndSendTransaction } = useMobileWallet()
  const invalidateBalance = useGetBalanceInvalidate({ address })

  return useMutation({
    mutationKey: ['transfer-sol', { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      let signature: TransactionSignature = ''
      try {
        const { transaction, latestBlockhash, minContextSlot } = await createTransaction({
          publicKey: address,
          destination: input.destination,
          amount: input.amount,
          connection,
        })

        // Send transaction and await for signature
        signature = await signAndSendTransaction(transaction, minContextSlot)

        // Wait for transaction to be confirmed
        // We use a manual polling strategy here because WebSockets can be unstable in mobile environments
        // especially when switching between the app and the wallet.
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
          throw new Error('Transaction confirmation timeout')
        }

        console.log(signature)
        return signature
      } catch (error: unknown) {
        console.log('error', `Transaction failed! ${error}`, signature)

        return
      }
    },
    onSuccess: async (signature) => {
      console.log(signature)
      await invalidateBalance()
    },
    onError: (error) => {
      console.error(`Transaction failed! ${error}`)
    },
  })
}
