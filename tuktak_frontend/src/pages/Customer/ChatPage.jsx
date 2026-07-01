import { useMemo, useState } from 'react'
import { Avatar } from '../../components/customer/FormControls'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import chatIcon from '../../assets/figma/chat.png'

const FILTERS = [
    { key: 'all', label: '전체' },
    { key: 'unread', label: '안 읽음' },
    { key: 'reserved', label: '예약 시공' },
    { key: 'completed', label: '시공 완료' },
]

export function ChatListPage({ threads, goToRoom, go }) {
    const [filter, setFilter] = useState('all')

    const filteredThreads = useMemo(() => {
        switch (filter) {
            case 'unread':
                return threads.filter((thread) => thread.unread > 0)

            case 'reserved':
                return threads.filter(
                    (thread) => thread.status === 'reserved'
                )

            case 'completed':
                return threads.filter(
                    (thread) => thread.status === 'completed'
                )

            default:
                return threads
        }
    }, [threads, filter])

    return (
        <section className="chat-list-screen">

            <CustomerTopBar
                title="채팅"
                go={go}
                compact
                hideTitle
            />

            <div className="chat-page-title">

                <img src={chatIcon} alt="채팅" />

                <h2>채팅</h2>

            </div>

            <div className="chat-filter">

                {FILTERS.map((item) => (
                    <button
                        key={item.key}
                        className={filter === item.key ? 'active' : ''}
                        onClick={() => setFilter(item.key)}
                    >
                        {item.label}
                    </button>
                ))}

            </div>

            <div className="list-stack">

                {filteredThreads.length === 0 ? (
                    <div className="chat-empty">
                        표시할 채팅이 없습니다.
                    </div>
                ) : (
                    filteredThreads.map((thread) => (
                        <button
                            key={thread.id}
                            className={`chat-thread flat ${thread.unread > 0 ? 'unread' : ''}`}
                            onClick={() => goToRoom(thread.id)}
                        >
                            <Avatar tone="blue" />

                            <div className="chat-thread-copy">

                                <div className="chat-thread-head">
                                    <strong>{thread.name}</strong>
                                    <time>{thread.time}</time>
                                </div>

                                <span>{thread.preview}</span>

                            </div>

                            {!!thread.unread && (
                                <em>{thread.unread}</em>
                            )}

                        </button>
                    ))
                )}

            </div>

        </section>
    )
}