'use client'

import { useCallback, useEffect, useState } from "react";
import TaskSummaryCard from './components/task-summary-card';
import { fetchTasks } from './lib/tasks';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      setTasks(await fetchTasks());
    } catch (error) {
      setMessage(error.message || "خطایی در ارتباط با سرویس رخ داد.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const startProcess = async () => {
    setStarting(true);
    setMessage("");

    try {
      const r = await fetch("/api/start-process", {
        method: "POST",
        body: JSON.stringify({ foo: "bar" }),
        headers: { "Content-Type": "application/json" }
      });

      if (!r.ok) {
        throw new Error("شروع سناریوی جدید ناموفق بود.");
      }

      await loadTasks();
    } catch (error) {
      setMessage(error.message || "شروع سناریو با خطا روبه‌رو شد.");
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <main className="app-shell">
      <section className="workspace">
        <nav className="brand-nav" aria-label="ناوبری اصلی">
          <a className="nav-brand" href="https://www.mehrparsict.com/" target="_blank" rel="noreferrer">
            <img src="/brand/mehrpars-purple.svg" alt="لوگوی مهرپارس" />
            <span>
              <strong>مهرپارس</strong>
              <small>کارتابل درخواست‌ها</small>
            </span>
          </a>
          <div className="nav-links" aria-label="دسترسی سریع">
            <a href="https://www.mehrparsict.com/" target="_blank" rel="noreferrer">mehrparsict.com</a>
            <span>دانش‌بنیان</span>
            <span>رتبه ۲ انفورماتیک</span>
          </div>
        </nav>

        <header className="hero-panel">
          <div className="brand-block">
            <div>
              <p className="eyebrow">کارتابل سازمانی مهرپارس</p>
              <h1>درخواست‌های جاری</h1>
              <p className="hero-copy">
                درخواست‌های باز، فرم‌های در انتظار تکمیل و وضعیت اقدام‌ها در این بخش نمایش داده می‌شود.
              </p>
              <div className="hero-badges" aria-label="حوزه‌های فعالیت">
                <span>دولت الکترونیک</span>
                <span>زیرساخت‌های ICT</span>
                <span>امنیت و پایش</span>
              </div>
            </div>
          </div>

          <div className="hero-actions">
            <div className="metric-card">
              <span>در انتظار اقدام</span>
              <strong>{tasks.length.toLocaleString('fa-IR')}</strong>
            </div>
            <button
              className="primary-action"
              onClick={startProcess}
              disabled={starting}
            >
              <span aria-hidden="true">+</span>
              {starting ? 'در حال ایجاد...' : 'شروع سناریوی جدید'}
            </button>
          </div>
        </header>

        <div className="content-grid">
          <aside className="scenario-panel">
            <p className="eyebrow">سناریوی جلسه</p>
            <h2>درخواست تأیید خرید</h2>
            <p>
              جریان نمونه برای بررسی درخواست خرید و ثبت اطلاعات مورد نیاز واحد مربوطه.
            </p>
            <div className="steps">
              <span>۱. ایجاد درخواست</span>
              <span>۲. بررسی اطلاعات</span>
              <span>۳. ارسال برای تصمیم‌گیری</span>
            </div>
            <div className="capability-list">
              <strong>تمرکز دمو</strong>
              <span>نمایش صف درخواست‌ها</span>
              <span>تکمیل فرم هر درخواست</span>
              <span>ارسال نتیجه برای مرحله بعد</span>
            </div>
          </aside>

          <section className="task-board" aria-live="polite">
            <div className="board-header">
              <div>
                <p className="eyebrow">صف کار</p>
                <h2>درخواست‌های قابل اقدام</h2>
              </div>
              <button className="ghost-action" onClick={loadTasks} disabled={loading}>
                {loading ? 'در حال بروزرسانی' : 'بروزرسانی'}
              </button>
            </div>

            {message && <div className="notice error">{message}</div>}

            {loading ? (
              <div className="task-list" aria-hidden="true">
                {[1, 2].map((item) => (
                  <article className="task-summary-card task-summary-card--loading" key={item}>
                    <div className="task-summary-main">
                      <span className="task-index skeleton-index" />
                      <div className="task-heading-skeleton">
                        <span className="skeleton-line tiny" />
                        <span className="skeleton-line title" />
                      </div>
                    </div>
                    <div className="task-summary-side">
                      <span className="status-pill status-pill--loading">در حال دریافت</span>
                      <span className="skeleton-line tiny" />
                    </div>
                  </article>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <strong>درخواستی برای اقدام وجود ندارد.</strong>
                <span>برای اجرای دمو، یک سناریوی جدید شروع کنید.</span>
              </div>
            ) : (
              <div className="task-list">
                {tasks.map((task, index) => (
                  <TaskSummaryCard
                    key={task.id}
                    task={task}
                    order={index + 1}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className="brand-footer">
          <div className="footer-brand">
            <img src="/brand/mehrpars-white.svg" alt="لوگوی مهرپارس" />
            <div>
              <strong>شرکت مهندسی فناوری اطلاعات و ارتباطات مهرپارس</strong>
              <p>
                شرکت دانش‌بنیان خصوصی فعال در تولید زیرساخت‌های پیشرفته فناوری اطلاعات و ارتباطات.
              </p>
            </div>
          </div>
          <div className="footer-meta">
            <span>info@mparsict.com</span>
            <span>+۹۸۲۱-۹۱۶ ۹۰ ۷۴۷</span>
            <a href="https://www.mehrparsict.com/" target="_blank" rel="noreferrer">mehrparsict.com</a>
          </div>
        </footer>
      </section>
    </main>
  );
}
