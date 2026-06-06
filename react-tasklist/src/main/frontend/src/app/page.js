'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from "react";

const Task = dynamic(() => import('./components/task'), { ssr: false });

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const r = await fetch('/api/tasks');

      if (!r.ok) {
        throw new Error("امکان دریافت فهرست درخواست‌ها وجود ندارد.");
      }

      const json = await r.json();
      setTasks(Array.isArray(json) ? json : []);
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
        <header className="hero-panel">
          <div className="brand-block">
            <div className="brand-mark" aria-hidden="true">در</div>
            <div>
              <p className="eyebrow">دموی سناریوی فرایندی</p>
              <h1>میز کار درخواست‌ها</h1>
              <p className="hero-copy">
                ثبت، بررسی و تکمیل درخواست‌ها در یک نمای ساده، فارسی و آماده ارائه.
              </p>
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
              این صفحه برای نمایش مسیر دریافت اطلاعات، تکمیل فرم و ارسال نتیجه طراحی شده است.
            </p>
            <div className="steps">
              <span>۱. ایجاد درخواست</span>
              <span>۲. بررسی اطلاعات</span>
              <span>۳. ارسال برای تصمیم‌گیری</span>
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
              <div className="empty-state">در حال دریافت درخواست‌ها...</div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <strong>درخواستی برای اقدام وجود ندارد.</strong>
                <span>برای اجرای دمو، یک سناریوی جدید شروع کنید.</span>
              </div>
            ) : (
              <div className="task-list">
                {tasks.map((task, index) => (
                  <Task
                    key={task.id}
                    taskId={task.id}
                    order={index + 1}
                    onDone={loadTasks}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
