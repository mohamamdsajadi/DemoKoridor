'use client'

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import TaskDetail from '../../components/task';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.taskId;

  return (
    <main className="app-shell">
      <section className="workspace detail-workspace">
        <nav className="brand-nav" aria-label="ناوبری اصلی">
          <Link className="nav-brand" href="/">
            <img src="/brand/mehrpars-purple.svg" alt="لوگوی مهرپارس" />
            <span>
              <strong>مهرپارس</strong>
              <small>جزئیات درخواست</small>
            </span>
          </Link>
          <div className="nav-links" aria-label="دسترسی سریع">
            <Link href="/">بازگشت به صف کار</Link>
            <span>فرم سازمانی</span>
          </div>
        </nav>

        <section className="detail-shell">
          <div className="detail-header">
            <div>
              <p className="eyebrow">درخواست فعال</p>
              <h1>تکمیل اطلاعات درخواست</h1>
              <p className="hero-copy">
                فقط فرم همین درخواست بارگذاری می‌شود تا تجربه سبک‌تر، پایدارتر و مناسب‌تر برای کار عملیاتی باشد.
              </p>
            </div>
            <Link className="ghost-action" href="/">بازگشت</Link>
          </div>

          <TaskDetail
            taskId={taskId}
            order={1}
            onDone={() => router.push('/')}
          />
        </section>
      </section>
    </main>
  );
}
