import Link from 'next/link';

export default function TaskSummaryCard({ task, order }) {
  const taskId = task?.id;
  const title = task?.name || `درخواست شماره ${Number(order || 1).toLocaleString('fa-IR')}`;

  return (
    <Link className="task-summary-card" href={`/tasks/${taskId}`}>
      <div className="task-summary-main">
        <span className="task-index">{Number(order || 1).toLocaleString('fa-IR')}</span>
        <div>
          <p className="eyebrow">در انتظار اقدام</p>
          <h3>{title}</h3>
          <p className="summary-copy">برای مشاهده جزئیات و تکمیل فرم وارد درخواست شوید.</p>
        </div>
      </div>
      <div className="task-summary-side">
        <span className="status-pill status-pill--ready">آماده اقدام</span>
        <span className="open-indicator">مشاهده</span>
      </div>
    </Link>
  );
}
