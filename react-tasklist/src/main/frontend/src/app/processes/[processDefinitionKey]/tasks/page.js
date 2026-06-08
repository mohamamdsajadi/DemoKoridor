'use client'

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import TaskSummaryCard from '../../../components/task-summary-card';
import {
  fetchProcessDefinitions,
  fetchTasks,
  startProcessInstance
} from '../../../lib/tasks';

export default function ProcessTasksPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const processDefinitionKey = params?.processDefinitionKey
    ? decodeURIComponent(params.processDefinitionKey)
    : "";
  const startedInstanceKey = searchParams.get('startedInstanceKey');
  const startedInstanceHandled = useRef("");
  const [processDefinition, setProcessDefinition] = useState();
  const [tasks, setTasks] = useState([]);
  const [loadingProcess, setLoadingProcess] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState("");

  const loadProcess = useCallback(async () => {
    setLoadingProcess(true);

    try {
      const items = await fetchProcessDefinitions();
      setProcessDefinition(
        items.find((item) => item.processDefinitionKey === processDefinitionKey)
      );
    } catch (error) {
      setMessage(error.message || "دریافت اطلاعات فرایند با خطا روبه‌رو شد.");
    } finally {
      setLoadingProcess(false);
    }
  }, [processDefinitionKey]);

  const loadTasks = useCallback(async (options = {}) => {
    const { silent = false } = options;
    if (!silent) {
      setLoadingTasks(true);
    }
    setMessage("");

    try {
      const items = await fetchTasks(processDefinitionKey);
      setTasks(items);
      return items;
    } catch (error) {
      setMessage(error.message || "دریافت تسک‌های فرایند با خطا روبه‌رو شد.");
      setTasks([]);
      return [];
    } finally {
      if (!silent) {
        setLoadingTasks(false);
      }
    }
  }, [processDefinitionKey]);

  const waitForStartedTask = useCallback(async (processInstanceKey) => {
    setLoadingTasks(true);
    setMessage("");

    try {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        if (attempt > 0) {
          await delay(1000);
        }

        const items = await fetchTasks(processDefinitionKey);
        setTasks(items);

        const hasStartedTask = processInstanceKey
          ? items.some((task) => String(task.processInstanceKey) === String(processInstanceKey))
          : items.length > 0;

        if (hasStartedTask) {
          return items;
        }
      }

      setMessage("فرایند شروع شد، اما تسک جدید هنوز در Tasklist آماده نشده است. چند لحظه دیگر بروزرسانی کنید.");
      return [];
    } catch (error) {
      setMessage(error.message || "دریافت تسک جدید با خطا روبه‌رو شد.");
      return [];
    } finally {
      setLoadingTasks(false);
    }
  }, [processDefinitionKey]);

  const startProcess = async () => {
    setStarting(true);
    setMessage("");

    try {
      const result = await startProcessInstance(processDefinitionKey);
      await waitForStartedTask(result?.processInstanceKey);
    } catch (error) {
      setMessage(error.message || "شروع فرایند با خطا روبه‌رو شد.");
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (processDefinitionKey) {
      loadProcess();
      loadTasks();
    }
  }, [loadProcess, loadTasks, processDefinitionKey]);

  useEffect(() => {
    if (
      processDefinitionKey &&
      startedInstanceKey &&
      startedInstanceHandled.current !== startedInstanceKey
    ) {
      startedInstanceHandled.current = startedInstanceKey;
      waitForStartedTask(startedInstanceKey);
    }
  }, [processDefinitionKey, startedInstanceKey, waitForStartedTask]);

  const title = getProcessTitle(processDefinition) || "تسک‌های فرایند";

  return (
    <main className="app-shell">
      <section className="workspace">
        <nav className="brand-nav" aria-label="ناوبری اصلی">
          <Link className="nav-brand" href="/">
            <img src="/brand/mehrpars-purple.svg" alt="لوگوی مهرپارس" />
            <span>
              <strong>مهرپارس</strong>
              <small>تسک‌های فرایند</small>
            </span>
          </Link>
          <div className="nav-links" aria-label="دسترسی سریع">
            <Link href="/">همه فرایندها</Link>
            <span>سطح دوم</span>
          </div>
        </nav>

        <section className="detail-shell">
          <div className="detail-header">
            <div>
              <p className="eyebrow">صف کار فرایند</p>
              <h1>{loadingProcess ? "در حال دریافت فرایند" : title}</h1>
              <p className="hero-copy">
                تسک‌ها با فیلتر processDefinitionKey همین فرایند دریافت می‌شوند.
              </p>
            </div>
            <div className="header-actions">
              <button className="primary-action" onClick={startProcess} disabled={starting || !processDefinitionKey}>
                <span aria-hidden="true">+</span>
                {starting ? 'در حال شروع...' : 'شروع instance جدید'}
              </button>
              <button className="ghost-action" onClick={loadTasks} disabled={loadingTasks || !processDefinitionKey}>
                {loadingTasks ? 'در حال بروزرسانی' : 'بروزرسانی تسک‌ها'}
              </button>
            </div>
          </div>

          <div className="process-context">
            <span>Key: {processDefinitionKey || '-'}</span>
            <span>ID: {processDefinition?.processDefinitionId || '-'}</span>
            <span>Version: {processDefinition?.version ? Number(processDefinition.version).toLocaleString('fa-IR') : '-'}</span>
          </div>

          {message && <div className="notice error">{message}</div>}

          {loadingTasks ? (
            <div className="task-list" aria-hidden="true">
              {[1, 2, 3].map((item) => (
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
              <strong>تسکی برای این فرایند وجود ندارد.</strong>
              <span>یک instance جدید شروع کنید یا چند لحظه بعد صف کار را بروزرسانی کنید.</span>
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
      </section>
    </main>
  );
}

function getProcessTitle(processDefinition) {
  return (
    processDefinition?.name ||
    processDefinition?.processDefinitionId ||
    processDefinition?.resourceName ||
    ""
  );
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
