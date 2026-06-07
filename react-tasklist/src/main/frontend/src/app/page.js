'use client'

import { useCallback, useEffect, useState } from "react";
import TaskSummaryCard from './components/task-summary-card';
import {
  fetchProcessDefinitions,
  fetchTasks,
  startProcessInstance
} from './lib/tasks';

export default function Home() {
  const [processDefinitions, setProcessDefinitions] = useState([]);
  const [selectedProcessKey, setSelectedProcessKey] = useState("");
  const [tasks, setTasks] = useState([]);
  const [starting, setStarting] = useState(false);
  const [loadingProcesses, setLoadingProcesses] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [message, setMessage] = useState("");
  const selectedProcess = processDefinitions.find(
    (processDefinition) => processDefinition.processDefinitionKey === selectedProcessKey
  );

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true);
    setMessage("");

    try {
      setTasks(await fetchTasks(selectedProcessKey));
    } catch (error) {
      setMessage(error.message || "خطایی در ارتباط با سرویس رخ داد.");
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [selectedProcessKey]);

  const loadProcessDefinitions = useCallback(async () => {
    setLoadingProcesses(true);
    setMessage("");

    try {
      const items = await fetchProcessDefinitions();
      setProcessDefinitions(items);
      setSelectedProcessKey((current) => current || items[0]?.processDefinitionKey || "");
    } catch (error) {
      setMessage(error.message || "دریافت فرایندها با خطا روبه‌رو شد.");
      setProcessDefinitions([]);
      setSelectedProcessKey("");
    } finally {
      setLoadingProcesses(false);
    }
  }, []);

  const startProcess = async () => {
    if (!selectedProcessKey) {
      setMessage("برای شروع، ابتدا یک فرایند را انتخاب کنید.");
      return;
    }

    setStarting(true);
    setMessage("");

    try {
      await startProcessInstance(selectedProcessKey);
      await loadTasks();
    } catch (error) {
      setMessage(error.message || "شروع فرایند با خطا روبه‌رو شد.");
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    loadProcessDefinitions();
  }, [loadProcessDefinitions]);

  useEffect(() => {
    if (selectedProcessKey) {
      loadTasks();
    } else {
      setTasks([]);
      setLoadingTasks(false);
    }
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
              <p className="eyebrow">کارتابل چندفرایندی مهرپارس</p>
              <h1>فرایند را انتخاب کنید و کارها را جلو ببرید</h1>
              <p className="hero-copy">
                ابتدا یکی از فرایندهای deploy شده را انتخاب کنید، instance جدید بسازید و سپس فرم‌های در انتظار همان فرایند را تکمیل کنید.
              </p>
              <div className="hero-badges" aria-label="حوزه‌های فعالیت">
                <span>Process Definition</span>
                <span>User Task</span>
                <span>Embedded Form</span>
              </div>
            </div>
          </div>

          <div className="hero-actions">
            <div className="metric-card">
              <span>کارهای این فرایند</span>
              <strong>{tasks.length.toLocaleString('fa-IR')}</strong>
            </div>
            <button
              className="primary-action"
              onClick={startProcess}
              disabled={starting || loadingProcesses || !selectedProcessKey}
            >
              <span aria-hidden="true">+</span>
              {starting ? 'در حال ایجاد...' : 'شروع فرایند انتخاب‌شده'}
            </button>
          </div>
        </header>

        <div className="content-grid">
          <aside className="scenario-panel">
            <div className="panel-title-row">
              <div>
                <p className="eyebrow">فرایندهای قابل اجرا</p>
                <h2>انتخاب فرایند</h2>
              </div>
              <button className="icon-action" onClick={loadProcessDefinitions} disabled={loadingProcesses} title="بروزرسانی فرایندها">
                ↻
              </button>
            </div>

            {loadingProcesses ? (
              <div className="process-list" aria-hidden="true">
                {[1, 2, 3].map((item) => (
                  <span className="process-option process-option--loading" key={item}>
                    <span className="skeleton-line title" />
                    <span className="skeleton-line tiny" />
                  </span>
                ))}
              </div>
            ) : processDefinitions.length === 0 ? (
              <div className="empty-state compact">فرایندی برای نمایش پیدا نشد.</div>
            ) : (
              <div className="process-list" role="listbox" aria-label="فرایندها">
                {processDefinitions.map((processDefinition) => {
                  const title = processDefinition.name || processDefinition.processDefinitionId || processDefinition.resourceName || "فرایند بدون نام";
                  const selected = processDefinition.processDefinitionKey === selectedProcessKey;

                  return (
                    <button
                      className={`process-option${selected ? " process-option--selected" : ""}`}
                      key={processDefinition.processDefinitionKey}
                      onClick={() => setSelectedProcessKey(processDefinition.processDefinitionKey)}
                      role="option"
                      aria-selected={selected}
                    >
                      <strong>{title}</strong>
                      <span>{processDefinition.processDefinitionId}</span>
                      <small>
                        نسخه {Number(processDefinition.version || 0).toLocaleString('fa-IR')}
                        {' · '}
                        key {processDefinition.processDefinitionKey}
                      </small>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="capability-list">
              <strong>فرایند انتخاب‌شده</strong>
              <span>{selectedProcess?.name || selectedProcess?.processDefinitionId || "هنوز انتخاب نشده"}</span>
              <span>{selectedProcess?.resourceName || "از سرور Camunda دریافت می‌شود"}</span>
              <span>{selectedProcess?.tenantId || "<default>"}</span>
            </div>
          </aside>

          <section className="task-board" aria-live="polite">
            <div className="board-header">
              <div>
                <p className="eyebrow">صف کار فرایند</p>
                <h2>{selectedProcess?.name || selectedProcess?.processDefinitionId || "درخواست‌های قابل اقدام"}</h2>
              </div>
              <button className="ghost-action" onClick={loadTasks} disabled={loadingTasks || !selectedProcessKey}>
                {loadingTasks ? 'در حال بروزرسانی' : 'بروزرسانی'}
              </button>
            </div>

            {message && <div className="notice error">{message}</div>}

            {loadingTasks ? (
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
                <strong>کاری برای این فرایند وجود ندارد.</strong>
                <span>یک instance جدید بسازید یا کمی بعد صف کار را بروزرسانی کنید.</span>
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
