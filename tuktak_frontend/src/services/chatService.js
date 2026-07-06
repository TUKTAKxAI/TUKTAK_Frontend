import { contractorChats } from '../data/contractorData'

export function fetchChatThreads() {
  return Promise.resolve(contractorChats)
}

export function fetchChatMessages(threadId) {
  return Promise.resolve([
    { id: `${threadId}-1`, from: 'customer', text: '내일 오후 3시에 방문 가능하실까요?' },
    { id: `${threadId}-2`, from: 'contractor', text: '네, 가능합니다. 방문 전에 연락드리겠습니다.' },
  ])
}
