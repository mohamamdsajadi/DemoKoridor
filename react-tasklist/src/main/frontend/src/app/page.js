'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from './components/app-shell';
import {
  formatFaNumber,
  getProcessSubtitle,
  getProcessTitle
} from './lib/display';
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

  const processLinks = useMemo(() => processDefinitions.map((processDefinition) => ({
    processDefinitionKey: processDefinition.processDefinitionKey,
    title: getProcessTitle(processDefinition)
  })), [processDefinitions]);

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
      setMessage("برای شروع، شناسه فرایند معتبر نیست.");
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

  const versionCount = processDefinitions.reduce((sum, item) => sum + Number(item.version || 0), 0);
  const startableCount = processDefinitions.filter((item) => item.hasStartForm !== false).length;

  return (
    <AppShell
      active="processes"
      title="داشبورد فرایندهای خدمت"
      eyebrow="سناریوی عملیاتی"
      subtitle="یک مرکز عملیات واقعی برای شروع پرونده، دیدن کارهای هر فرایند، تکمیل فرم مرحله و بستن همان کار."
      processLinks={processLinks}
      actions={(
        <button
          className="ghost-action"
          onClick={loadProcessDefinitions}
          disabled={loadingProcesses}
        >
          {loadingProcesses ? 'در حال بروزرسانی' : 'بروزرسانی فرایندها'}
        </button>
      )}
    >
      <section className="dashboard-grid">
        <article className="scenario-card">
          <p className="eyebrow">تحلیل سناریو</p>
          <h2>مرکز عملیات درخواست‌های سازمانی</h2>
          <p>
            این دمو را مثل میز کار یک تیم خدمات سازمانی طراحی کردم: مشتری یا اپراتور یک پرونده خدمت را شروع می‌کند، هر مرحله انسانی به صف کار می‌آید، کارشناس فرم همان مرحله را تکمیل می‌کند و بعد از ثبت، پرونده به گام بعدی فرایند می‌رود.
          </p>
          <div className="flow-rail" aria-label="جریان اصلی">
            <span>شروع پرونده</span>
            <span>صف کار فرایند</span>
            <span>تکمیل فرم مرحله</span>
            <span>ثبت نتیجه</span>
          </div>
        </article>

        <div className="metric-grid">
          <MetricCard label="فرایندهای آماده اجرا" value={formatFaNumber(processDefinitions.length)} />
          <MetricCard label="نسخه‌های عملیاتی" value={formatFaNumber(versionCount)} />
          <MetricCard label="فرایندهای قابل شروع" value={formatFaNumber(startableCount)} />
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">صف شروع</p>
            <h2>فرایندهای قابل اجرا</h2>
          </div>
          <Link className="text-action" href="/tasks">مشاهده همه کارهای فعال</Link>
        </div>

        {message && <div className="notice error">{message}</div>}

        {loadingProcesses ? (
          <div className="process-grid" aria-hidden="true">
            {[1, 2, 3, 4].map((item) => (
              <article className="process-card process-card--loading" key={item}>
                <span className="skeleton-line title" />
                <span className="skeleton-line medium" />
                <span className="skeleton-input" />
              </article>
            ))}
          </div>
        ) : processDefinitions.length === 0 ? (
          <div className="empty-state">
            <strong>فرایندی برای نمایش پیدا نشد.</strong>
            <span>اتصال Camunda یا دسترسی API جستجوی فرایندها را بررسی کنید.</span>
          </div>
        ) : (
          <div className="process-grid">
            {processDefinitions.map((processDefinition, index) => {
              const title = getProcessTitle(processDefinition);
              const key = processDefinition.processDefinitionKey;
              const starting = startingProcessKey === key;

              return (
                <article className="process-card" key={key}>
                  <div className="process-card-head">
                    <span className="process-avatar">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="eyebrow">مسیر خدمت</p>
                      <h3>{title}</h3>
                      <p className="process-copy">{getProcessSubtitle(processDefinition)}</p>
                    </div>
                    <span className="status-pill status-pill--ready">
                      نسخه {Number(processDefinition.version || 0).toLocaleString('fa-IR')}
                    </span>
                  </div>

                  <dl className="process-meta">
                    <div>
                      <dt>شناسه فرایند</dt>
                      <dd>{processDefinition.processDefinitionId || '-'}</dd>
                    </div>
                    <div>
                      <dt>کلید اجرا</dt>
                      <dd>{key}</dd>
                    </div>
                    <div>
                      <dt>منبع</dt>
                      <dd>{processDefinition.resourceName || '-'}</dd>
                    </div>
                  </dl>

                  <div className="process-actions">
                    <button
                      className="primary-action"
                      onClick={() => startProcess(key)}
                      disabled={Boolean(startingProcessKey)}
                    >
                      {starting ? 'در حال شروع...' : 'شروع پرونده'}
                    </button>
                    <Link className="ghost-action" href={`/processes/${encodeURIComponent(key)}/tasks`}>
                      صف کار
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
