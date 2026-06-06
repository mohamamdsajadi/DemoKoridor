'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from "react";

const ProcessForm = dynamic(
  () => import('./embedded-form'),
  { ssr: false }
)
const ReactForm = dynamic(
  () => import('./react-form'),
  { ssr: false }
)

export default function Task({ taskId, order, onDone }) {
  const [task, setTask] = useState();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const hasError = Boolean(error);
  const isUnavailable = !loading && !task;
  const state = loading
    ? "loading"
    : hasError || isUnavailable
      ? "error"
      : submitting
        ? "submitting"
        : "ready";
  const statusLabel = {
    loading: "در حال دریافت",
    ready: "آماده اقدام",
    submitting: "در حال ارسال",
    error: "نیازمند بررسی"
  }[state];

  const completeTask = useCallback(async (data) => {
    setSubmitting(true);
    setError("");

    try {
      const r = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });

      if (!r.ok) {
        throw new Error(`ارسال فرم ناموفق بود: ${r.statusText || r.status}`);
      }

      await onDone?.();
    } catch (err) {
      setError(err.message || "در ارسال اطلاعات خطایی رخ داد.");
    } finally {
      setSubmitting(false);
    }
  }, [onDone, taskId]);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/tasks/${taskId}`);

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "این درخواست دیگر در صف فعال نیست یا اطلاعات فرم آن در دسترس نیست."
              : `دریافت اطلاعات درخواست ناموفق بود: ${response.status}`
          );
        }

        const text = await response.text();

        if (!text) {
          throw new Error("پاسخ دریافتی از سرور خالی است.");
        }

        const json = JSON.parse(text);
        setTask(json);

      } catch (err) {
        setError(err.message || "خطایی در دریافت اطلاعات رخ داد.");
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  return (
    <article className={`task-card task-card--${state}`}>
      <div className="task-card-header">
        <div className="task-title-block">
          <span className="task-index">{Number(order || 1).toLocaleString('fa-IR')}</span>
          <div>
            <p className="eyebrow">{state === "error" ? "وضعیت درخواست" : "مرحله فعال"}</p>
            <h3>
              {loading
                ? "در حال دریافت اطلاعات"
                : task?.name || "اطلاعات درخواست در دسترس نیست"}
            </h3>
          </div>
        </div>
        <span className={`status-pill status-pill--${state}`}>{statusLabel}</span>
      </div>

      {error && <div className="notice error">{error}</div>}

      {loading ? (
        <TaskSkeleton />
      ) : task ? (
        task.schema ? (
          <ProcessForm
            schema={task.schema}
            data={task.data}
            onComplete={completeTask}
            submitting={submitting}
          />
        ) : (
          <ReactForm
            formKey={task.formKey}
            data={task.data}
            onComplete={completeTask}
            submitting={submitting}
          />
        )
      ) : (
        <div className="empty-state compact">فرم این درخواست قابل نمایش نیست.</div>
      )}
    </article>
  )
}

function TaskSkeleton() {
  return (
    <div className="task-skeleton" aria-hidden="true">
      <div className="skeleton-grid">
        <span className="skeleton-line medium" />
        <span className="skeleton-line short" />
      </div>
      <span className="skeleton-input" />
      <span className="skeleton-input" />
      <span className="skeleton-area" />
      <span className="skeleton-button" />
    </div>
  );
}
