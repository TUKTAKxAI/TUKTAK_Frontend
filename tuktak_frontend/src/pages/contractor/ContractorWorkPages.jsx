import { FaTools } from 'react-icons/fa'
import { contractorScreens, contractorWorkOrders } from '../../data/contractorData'
import { ContractorPage, StatusBadge } from './ContractorPageShared'

export function ContractorRecordsPage({ go }) {
  return (
    <ContractorPage title="시공 기록" go={go} back={() => go(contractorScreens.home)}>
      <div className="contractor-list">
        {contractorWorkOrders.map((item) => (
          <button className="contractor-line-card clickable" type="button" key={item.id} onClick={() => go(contractorScreens.recordDetail)}>
            <FaTools />
            <div>
              <strong>{item.title}</strong>
              <p>{item.region}</p>
              <small>{item.date} {item.time}</small>
            </div>
            <StatusBadge tone={item.status === '완료' ? 'gray' : 'blue'}>{item.status}</StatusBadge>
          </button>
        ))}
      </div>
    </ContractorPage>
  )
}

export function ContractorRecordDetailPage({ go }) {
  const item = contractorWorkOrders[0]

  return (
    <ContractorPage title="작업 상세" go={go} back={() => go(contractorScreens.records)}>
      <article className="contractor-detail-card">
        <StatusBadge>{item.status}</StatusBadge>
        <h1>{item.title}</h1>
        <p>{item.region}</p>
        <dl>
          <div><dt>일정</dt><dd>{item.date} {item.time}</dd></div>
          <div><dt>금액</dt><dd>{item.amount}</dd></div>
        </dl>
        <div className="contractor-button-row">
          <button type="button">시작 처리</button>
          <button type="button">완료 처리</button>
        </div>
      </article>
    </ContractorPage>
  )
}
