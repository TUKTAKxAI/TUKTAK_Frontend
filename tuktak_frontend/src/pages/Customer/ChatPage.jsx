import { useMemo, useRef, useState, useEffect } from 'react'
import { Avatar } from '../../components/customer/FormControls'
import { CustomerPage } from './CustomerPageShared'
import {
    FaChevronLeft,
    FaChevronRight,
    FaSearch,
    FaBars,
    FaTimes,
    FaPaperPlane,
    FaCog,
    FaImage,
    FaPaperclip,
    FaStar,
    FaSignOutAlt,
} from 'react-icons/fa'

const FILTERS = [
    { key: 'all', label: '전체' },
    { key: 'unread', label: '안 읽음' },
    { key: 'reserved', label: '예약 시공' },
    { key: 'completed', label: '시공 완료' },
]

export function ChatListPage({
    threads,
    messagesByThread,
    goToRoom,
    go,
    clearUnread,
}) {
    const [filter, setFilter] =
        useState('all')

    const filteredThreads =
        useMemo(() => {
            switch (filter) {
                case 'unread':
                    return threads.filter(
                        (thread) =>
                            thread.unread > 0
                    )

                case 'reserved':
                    return threads.filter(
                        (thread) =>
                            thread.status ===
                            'reserved'
                    )

                case 'completed':
                    return threads.filter(
                        (thread) =>
                            thread.status ===
                            'completed'
                    )

                default:
                    return threads
            }
        }, [threads, filter])

    const getLatestMessage = (
        threadId,
        fallback
    ) => {
        const messages =
            messagesByThread?.[threadId]

        if (!messages?.length) {
            return fallback
        }

        return messages[
            messages.length - 1
        ].text
    }

    return (
        <CustomerPage go={go} className="cds--white">
            <div className="chat-inbox">
                <h1 className="chat-inbox-heading">채팅</h1>

                <div className="chat-inbox-filters">
                    {FILTERS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={`chat-inbox-filter ${filter === item.key ? 'is-active' : ''}`}
                            onClick={() => setFilter(item.key)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="chat-inbox-list">
                    {filteredThreads.length === 0 ? (
                        <div className="chat-inbox-empty">표시할 채팅이 없습니다.</div>
                    ) : (
                        filteredThreads.map((thread) => (
                            <button
                                key={thread.id}
                                type="button"
                                className={`chat-inbox-item ${thread.unread > 0 ? 'is-unread' : ''}`}
                                onClick={() => {
                                    clearUnread?.(thread.id)
                                    goToRoom(thread.id)
                                }}
                            >
                                <Avatar tone="blue" />

                                <div className="chat-inbox-item-body">
                                    <div className="chat-inbox-item-head">
                                        <span className="chat-inbox-item-name">{thread.name}</span>
                                        <time className="chat-inbox-item-time">{thread.time}</time>
                                    </div>

                                    <span className="chat-inbox-item-preview">
                                        {getLatestMessage(thread.id, thread.preview)?.trim()}
                                    </span>
                                </div>

                                {!!thread.unread && (
                                    <span className="chat-inbox-item-badge">{thread.unread}</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </CustomerPage>
    )
}

export function ChatRoomPage({
    partnerName,
    messages,
    chatText,
    setChatText,
    sendMessage,
    back,
}) {
    const [showSearch, setShowSearch] =
        useState(false)

    const [showMenu, setShowMenu] =
        useState(false)

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') {
                setShowMenu(false)
            }
        }

        window.addEventListener(
            'keydown',
            handler
        )

        return () =>
            window.removeEventListener(
                'keydown',
                handler
            )
    }, [])

    const [searchText, setSearchText] =
        useState('')

    const [
        searchedText,
        setSearchedText,
    ] = useState('')

    const [
        searchResults,
        setSearchResults,
    ] = useState([])

    const [
        currentResultIndex,
        setCurrentResultIndex,
    ] = useState(0)

    const messageRefs = useRef([])
    const messagesContainerRef = useRef(null)

    useEffect(() => {
        const container = messagesContainerRef.current
        if (container) {
            container.scrollTop = container.scrollHeight
        }
    }, [messages])

    const escapeRegExp = (string) =>
        string.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        )

    const highlightText = (text) => {
        if (!searchedText.trim()) {
            return text
        }

        const regex = new RegExp(
            `(${escapeRegExp(
                searchedText
            )})`,
            'gi'
        )

        return text
            .split(regex)
            .map((part, index) =>
                part.toLowerCase() ===
                    searchedText.toLowerCase() ? (
                    <mark
                        key={index}
                        className="search-highlight"
                    >
                        {part}
                    </mark>
                ) : (
                    part
                )
            )
    }

    const moveSearchResult = (
        direction
    ) => {
        if (
            searchResults.length === 0
        ) {
            return
        }

        let nextIndex =
            currentResultIndex +
            direction

        if (nextIndex < 0) {
            nextIndex =
                searchResults.length - 1
        }

        if (
            nextIndex >=
            searchResults.length
        ) {
            nextIndex = 0
        }

        setCurrentResultIndex(
            nextIndex
        )

        const targetIndex =
            searchResults[nextIndex]

        messageRefs.current[
            targetIndex
        ]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
    }

    const handleSearch = () => {
        if (!searchText.trim()) {
            alert(
                '검색어를 입력해주세요.'
            )
            return
        }

        const results =
            messages.reduce(
                (
                    acc,
                    message,
                    index
                ) => {
                    if (
                        message.text
                            .toLowerCase()
                            .includes(
                                searchText.toLowerCase()
                            )
                    ) {
                        acc.push(index)
                    }

                    return acc
                },
                []
            )

        if (results.length === 0) {
            alert(
                '검색 결과가 없습니다.'
            )
            return
        }

        setSearchedText(searchText)
        setSearchResults(results)
        setCurrentResultIndex(0)

        setTimeout(() => {
            messageRefs.current[
                results[0]
            ]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 50)
    }

    return (
        <section className="chat-thread-view">
            <header className="chat-thread-view-header">
                {!showSearch ? (
                    <>
                        <button
                            type="button"
                            className="chat-thread-view-back"
                            onClick={back}
                            aria-label="뒤로가기"
                        >
                            <FaChevronLeft />
                        </button>

                        <div className="chat-thread-view-title">
                            <h1>{partnerName}</h1>
                        </div>

                        <div className="chat-thread-view-actions">
                            <button
                                type="button"
                                className="chat-thread-view-icon-button"
                                onClick={() => setShowSearch(true)}
                                aria-label="대화 검색"
                            >
                                <FaSearch />
                            </button>

                            <button
                                type="button"
                                className="chat-thread-view-icon-button"
                                onClick={() => setShowMenu(true)}
                                aria-label="채팅방 메뉴"
                            >
                                <FaBars />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="chat-thread-search">
                        <button
                            type="button"
                            className="chat-thread-view-back"
                            onClick={() => {
                                setShowSearch(false)
                                setSearchText('')
                                setSearchedText('')
                                setSearchResults([])
                                setCurrentResultIndex(0)
                            }}
                            aria-label="뒤로가기"
                        >
                            <FaChevronLeft />
                        </button>

                        <input
                            className="chat-thread-search-input"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            placeholder="대화 내용 검색"
                        />

                        <button
                            type="button"
                            className="chat-thread-search-submit"
                            onClick={handleSearch}
                        >
                            검색
                        </button>
                    </div>
                )}
            </header>

            <div className="chat-thread-messages" ref={messagesContainerRef}>
                {messages.map(
                    (
                        message,
                        index
                    ) => (
                        <div
                            key={index}
                            ref={(
                                el
                            ) => {
                                messageRefs.current[
                                    index
                                ] = el
                            }}
                            className={`chat-thread-message ${message.from ===
                                'me'
                                ? 'is-mine'
                                : ''
                                }`}
                        >
                            {highlightText(
                                message.text
                            )}
                        </div>
                    )
                )}
            </div>

            {showSearch &&
                searchResults.length >
                0 && (
                    <div className="chat-thread-search-nav">
                        <button
                            type="button"
                            className="chat-thread-search-nav-button"
                            onClick={() =>
                                moveSearchResult(
                                    -1
                                )
                            }
                            aria-label="이전 검색 결과"
                        >
                            <FaChevronLeft />
                        </button>

                        <span className="chat-thread-search-nav-count">
                            {currentResultIndex +
                                1}
                            /
                            {
                                searchResults.length
                            }
                        </span>

                        <button
                            type="button"
                            className="chat-thread-search-nav-button"
                            onClick={() =>
                                moveSearchResult(
                                    1
                                )
                            }
                            aria-label="다음 검색 결과"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                )}

            <div className="chat-thread-compose">
                <input
                    className="chat-thread-compose-input"
                    value={chatText}
                    placeholder="메시지를 입력하세요."
                    onChange={(
                        event
                    ) =>
                        setChatText(
                            event.target
                                .value
                        )
                    }
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            sendMessage();
                        }
                    }}
                />

                <button
                    type="button"
                    className="chat-thread-compose-send"
                    onClick={
                        sendMessage
                    }
                    aria-label="전송"
                >
                    <FaPaperPlane />
                </button>
            </div>

            <div
                className={`chat-thread-menu ${showMenu ? 'is-open' : ''
                    }`}
            >
                <div
                    className="chat-thread-menu-backdrop"
                    onClick={() => setShowMenu(false)}
                />

                <div className="chat-thread-menu-panel">
                    <div className="chat-thread-menu-top">
                        <h3>채팅방 메뉴</h3>

                        <button
                            type="button"
                            className="chat-thread-menu-close"
                            onClick={() => setShowMenu(false)}
                            aria-label="닫기"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <button
                        type="button"
                        className="chat-thread-menu-item"
                        onClick={() =>
                            alert('채팅 설정은 준비 중입니다.')
                        }
                    >
                        <FaCog aria-hidden="true" />
                        <span>채팅 설정</span>
                    </button>

                    <button
                        type="button"
                        className="chat-thread-menu-item"
                        onClick={() =>
                            alert('사진 기능은 준비 중입니다.')
                        }
                    >
                        <FaImage aria-hidden="true" />
                        <span>사진</span>
                    </button>

                    <button
                        type="button"
                        className="chat-thread-menu-item"
                        onClick={() =>
                            alert('파일 기능은 준비 중입니다.')
                        }
                    >
                        <FaPaperclip aria-hidden="true" />
                        <span>파일</span>
                    </button>

                    <button
                        type="button"
                        className="chat-thread-menu-item"
                        onClick={() =>
                            alert('즐겨찾기 기능은 준비 중입니다.')
                        }
                    >
                        <FaStar aria-hidden="true" />
                        <span>즐겨찾기</span>
                    </button>

                    <hr className="chat-thread-menu-divider" />

                    <button
                        type="button"
                        className="chat-thread-menu-item is-danger"
                        onClick={() => {
                            if (window.confirm('채팅방을 나가시겠습니까?')) {
                                back()
                            }
                        }}
                    >
                        <FaSignOutAlt aria-hidden="true" />
                        <span>채팅방 나가기</span>
                    </button>
                </div>
            </div>
        </section>
    )
}
