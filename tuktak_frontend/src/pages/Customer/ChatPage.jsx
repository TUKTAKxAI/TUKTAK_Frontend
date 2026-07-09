import { useMemo, useRef, useState, useEffect } from 'react'
import { Avatar } from '../../components/customer/FormControls'
import { CustomerTopBar } from '../../components/customer/CustomerTopBar'
import { figmaAssets } from '../../components/customer/figmaAssets'
import chatIcon from '../../assets/figma/chat.png'

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
        <section className="chat-list-screen">
            <CustomerTopBar
                title="채팅"
                go={go}
                compact
                hideTitle
            />

            <div className="chat-page-title">
                <img
                    src={chatIcon}
                    alt="채팅"
                />
                <h2>채팅</h2>
            </div>

            <div className="chat-filter">
                {FILTERS.map((item) => (
                    <button
                        key={item.key}
                        className={
                            filter === item.key
                                ? 'active'
                                : ''
                        }
                        onClick={() =>
                            setFilter(item.key)
                        }
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="list-stack">
                {filteredThreads.length ===
                    0 ? (
                    <div className="chat-empty">
                        표시할 채팅이
                        없습니다.
                    </div>
                ) : (
                    filteredThreads.map(
                        (thread) => (
                            <button
                                key={
                                    thread.id
                                }
                                className={`chat-thread flat ${thread.unread >
                                    0
                                    ? 'unread'
                                    : ''
                                    }`}
                                onClick={() => {
                                    clearUnread?.(
                                        thread.id
                                    )

                                    goToRoom(
                                        thread.id
                                    )
                                }}
                            >
                                <Avatar tone="blue" />

                                <div className="chat-thread-copy">
                                    <div className="chat-thread-head">
                                        <strong>
                                            {
                                                thread.name
                                            }
                                        </strong>

                                        <time>
                                            {
                                                thread.time
                                            }
                                        </time>
                                    </div>

                                    <span>
                                        {getLatestMessage(
                                            thread.id,
                                            thread.preview
                                        )?.trim()}
                                    </span>
                                </div>

                                {!!thread.unread && (
                                    <em>
                                        {
                                            thread.unread
                                        }
                                    </em>
                                )}
                            </button>
                        )
                    )
                )}
            </div>
        </section>
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
        <section className="chat-room-screen">
            <header className="chat-room-head">
                {!showSearch ? (
                    <>
                        <button
                            className="inline-back-arrow"
                            onClick={back}
                        >
                            <img src={figmaAssets.back} alt="뒤로가기" />
                        </button>

                        <div className="chat-room-title">
                            <h1>
                                {
                                    partnerName
                                }
                            </h1>
                        </div>

                        <div className="chat-room-actions">
                            <button
                                onClick={() =>
                                    setShowSearch(
                                        true
                                    )
                                }
                            >
                                ⌕
                            </button>

                            <button
                                onClick={() =>
                                    setShowMenu(true)
                                }
                            >
                                ☰
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="chat-search-header">
                        <button
                            className="inline-back-arrow"
                            onClick={() => {
                                setShowSearch(
                                    false
                                )
                                setSearchText(
                                    ''
                                )
                                setSearchedText(
                                    ''
                                )
                                setSearchResults(
                                    []
                                )
                                setCurrentResultIndex(
                                    0
                                )
                            }}
                        >
                            <img src={figmaAssets.back} alt="뒤로가기" />
                        </button>

                        <input
                            value={
                                searchText
                            }
                            onChange={(
                                e
                            ) =>
                                setSearchText(
                                    e.target
                                        .value
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            placeholder="대화 내용 검색"
                        />

                        <button
                            className="chat-search-btn"
                            onClick={
                                handleSearch
                            }
                        >
                            검색
                        </button>
                    </div>
                )}
            </header>

            <div className="message-list roomy">
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
                            className={`message ${message.from ===
                                'me'
                                ? 'mine'
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
                    <div className="search-navigation-overlay">
                        <button
                            onClick={() =>
                                moveSearchResult(
                                    -1
                                )
                            }
                        >
                            ◀
                        </button>

                        <span>
                            {currentResultIndex +
                                1}
                            /
                            {
                                searchResults.length
                            }
                        </span>

                        <button
                            onClick={() =>
                                moveSearchResult(
                                    1
                                )
                            }
                        >
                            ▶
                        </button>
                    </div>
                )}

            <div className="chat-compose">
                <input
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
                    onClick={
                        sendMessage
                    }
                >
                    ➤
                </button>
            </div>

            <div
                className={`chat-menu-wrapper ${showMenu ? 'open' : ''
                    }`}
            >
                <div
                    className="chat-menu-backdrop"
                    onClick={() => setShowMenu(false)}
                />

                <div className="chat-menu">
                    <div className="chat-menu-top">
                        <h3>채팅방 메뉴</h3>

                        <button
                            className="chat-menu-close"
                            onClick={() => setShowMenu(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <button
                        className="chat-menu-item"
                        onClick={() =>
                            alert('채팅 설정은 준비 중입니다.')
                        }
                    >
                        <span className="icon">⚙️</span>
                        <span>채팅 설정</span>
                    </button>

                    <button
                        className="chat-menu-item"
                        onClick={() =>
                            alert('사진 기능은 준비 중입니다.')
                        }
                    >
                        <span className="icon">🖼️</span>
                        <span>사진</span>
                    </button>

                    <button
                        className="chat-menu-item"
                        onClick={() =>
                            alert('파일 기능은 준비 중입니다.')
                        }
                    >
                        <span className="icon">📎</span>
                        <span>파일</span>
                    </button>

                    <button
                        className="chat-menu-item"
                        onClick={() =>
                            alert('즐겨찾기 기능은 준비 중입니다.')
                        }
                    >
                        <span className="icon">⭐</span>
                        <span>즐겨찾기</span>
                    </button>

                    <hr className="chat-menu-divider" />

                    <button
                        className="chat-menu-item danger"
                        onClick={() => {
                            if (window.confirm('채팅방을 나가시겠습니까?')) {
                                back()
                            }
                        }}
                    >
                        <span className="icon">🚪</span>
                        <span>채팅방 나가기</span>
                    </button>
                </div>
            </div>
        </section>
    )
}
