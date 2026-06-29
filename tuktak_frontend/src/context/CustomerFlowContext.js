import { createContext, useContext } from 'react'

export const CustomerFlowContext = createContext(null)

export function useCustomerFlow() {
  const context = useContext(CustomerFlowContext)
  if (!context) {
    throw new Error('useCustomerFlow must be used inside CustomerFlowProvider')
  }
  return context
}
