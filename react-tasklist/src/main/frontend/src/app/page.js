'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from "react";
import {
  fetchProcessDefinitions,
  startProcessInstance
} from './lib/tasks';

export default function Home() {
  const router = useRouter();
  const [processDefinitions, setProcessDefinitions] = useState([]);
  const [startingProcessKey, setStartingProcessKey] = useState("");
  const [loadingProcesses, setLoadingProcesses] = useState(true);
  const [message, setMessage] = useState("");

  const loadProcessDefinitions = useCallback(async () => {
    setLoadingProcesses(true);
    setMessage("");

    try {
      const items = await fetchProcessDefinitions();
      setProcessDefinitions(items);
    } catch (error) {
      setMessage(error.message || "دریافت فرایندها با خطا روبه‌رو شد.");
      setProcessDefinitions([]);
    } finally {
      setLoadingProcesses(false);
    }
  }, []);

  const startProcess = async (processDefinitionKey) => {
    if (!processDefinitionKey) {
      setMessage("برای شروع، processDefinitionKey معتبر نیست.");
      return;
    }

    setStartingProcessKey(processDefinitionKey);
    setMessage("");

    try {
      const result = await startProcessInstance(processDefinitionKey);
      const href = `/processes/${encodeURIComponent(processDefinitionKey)}/tasks`;
      const startedInstanceKey = result?.processInstanceKey
        ? `?startedInstanceKey=${encodeURIComponent(result.processInstanceKey)}`
        : "";
      router.push(`${href}${startedInstanceKey}`);
    } catch (error) {
      setMessage(error.message || "شروع فرایند با خطا روبه‌رو شد.");
    } finally {
      setStartingProcessKey("");
    }
  };

  useEffect(() => {
    loadProcessDefinitions();
  }, [loadProcessDefinitions]);

  return (
    <main className="app-shell">
      <section className="workspace">
        <nav className="brand-nav" aria-label="ناوبری اصلی">
          <a className="nav-brand" href="https://www.mehrparsict.com/" target="_blank" rel="noreferrer">
            <img src="/brand/mehrpars-purple.svg" alt="لوگوی مهرپارس" />
            <span>
              <strong>مهرپارس</strong>
              <small>فرایندهای سازمانی</small>
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
              <p className="eyebrow">کارتابل چندفرایندی مهرپارس</p>
              <h1>فرایندهای قابل اجرا</h1>
              <p className="hero-copy">
                لیست process definitionها از Camunda دریافت می‌شود. هر فرایند را می‌توانید شروع کنید یا وارد صف taskهای همان فرایند شوید.
              </p>
              <div className="hero-badges" aria-label="حوزه‌های فعالیت">
                <span>۱. فرایندها</span>
                <span>۲. تسک‌های فرایند</span>
                <span>۳. فرم تسک</span>
              </div>
            </div>
          </div>

          <div className="hero-actions">
            <div className="metric-card">
              <span>فرایندهای دریافتی</span>
              <strong>{processDefinitions.length.toLocaleString('fa-IR')}</strong>
            </div>
            <button
              className="ghost-action"
              onClick={loadProcessDefinitions}
              disabled={loadingProcesses}
            >
              {loadingProcesses ? 'در حال بروزرسانی' : 'بروزرسانی'}
            </button>
          </div>
        </header>

        <section className="task-board process-board" aria-live="polite">
          <div className="board-header">
            <div>
              <p className="eyebrow">سطح اول</p>
              <h2>انتخاب فرایند</h2>
            </div>
          </div>

          {message && <div className="notice error">{message}</div>}

          {loadingProcesses ? (
            <div className="process-grid" aria-hidden="true">
              {[1, 2, 3, 4].map((item) => (
                <article className="process-card process-card--loading" key={item}>
                  <span className="skeleton-line title" />
                  <span className="skeleton-line tiny" />
                  <span className="skeleton-input" />
                </article>
              ))}
            </div>
          ) : processDefinitions.length === 0 ? (
            <div className="empty-state">
              <strong>فرایندی برای نمایش پیدا نشد.</strong>
              <span>اتصال Camunda یا دسترسی API جستجوی process definition را بررسی کنید.</span>
            </div>
          ) : (
            <div className="process-grid">
              {processDefinitions.map((processDefinition) => {
                const title = getProcessTitle(processDefinition);
                const key = processDefinition.processDefinitionKey;
                const starting = startingProcessKey === key;

                return (
                  <article className="process-card" key={key}>
                    <div className="process-card-head">
                      <div>
                        <p className="eyebrow">Process Definition</p>
                        <h3>{title}</h3>
                      </div>
                      <span className="status-pill status-pill--ready">
                        v{Number(processDefinition.version || 0).toLocaleString('fa-IR')}
                      </span>
                    </div>

                    <dl className="process-meta">
                      <div>
                        <dt>ID</dt>
                        <dd>{processDefinition.processDefinitionId || '-'}</dd>
                      </div>
                      <div>
                        <dt>Key</dt>
                        <dd>{key}</dd>
                      </div>
                      <div>
                        <dt>Resource</dt>
                        <dd>{processDefinition.resourceName || '-'}</dd>
                      </div>
                    </dl>

                    <div className="process-actions">
                      <button
                        className="primary-action"
                        onClick={() => startProcess(key)}
                        disabled={Boolean(startingProcessKey)}
                      >
                        <span aria-hidden="true">+</span>
                        {starting ? 'در حال شروع...' : 'شروع فرایند'}
                      </button>
                      <Link className="ghost-action" href={`/processes/${encodeURIComponent(key)}/tasks`}>
                        مشاهده تسک‌ها
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

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

function getProcessTitle(processDefinition) {
  return (
    processDefinition?.name ||
    processDefinition?.processDefinitionId ||
    processDefinition?.resourceName ||
    "فرایند بدون نام"
  );
}
