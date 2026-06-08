import Link from 'next/link';
import { getDisplayTaskTitle } from '../lib/display';

export default function TaskSummaryCard({ task, order }) {
  const taskId = task?.id;
  const processDefinitionKey = task?.processDefinitionKey;
  const href = processDefinitionKey
    ? `/tasks/${taskId}?processDefinitionKey=${encodeURIComponent(processDefinitionKey)}`
    : `/tasks/${taskId}`;
  const title = getDisplayTaskTitle(
    task,
    `درخواست شماره ${Number(order || 1).toLocaleString('fa-IR')}`
  );

  return (
    <Link className="task-summary-card" href={href}>
      <div className="task-summary-main">
        <span className="task-index">{Number(order || 1).toLocaleString('fa-IR')}</span>
        <div>
          <p className="eyebrow">در انتظار اقدام</p>
          <h3>{title}</h3>
          <p className="summary-copy">
            {task?.processInstanceKey
              ? `Instance ${task.processInstanceKey}`
              : "برای تکمیل فرم، درخواست را باز کنید."}
          </p>
        </div>
      </div>
      <div className="task-summary-side">
        <span className="status-pill status-pill--ready">آماده اقدام</span>
        <span className="open-indicator">مشاهده</span>
      </div>
    </Link>
  );
}
