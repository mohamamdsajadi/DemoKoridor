'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from "react";
import { completeTask, fetchTask } from '../lib/tasks';

const ProcessForm = dynamic(
  () => import('./embedded-form'),
  { ssr: false, loading: () => <TaskSkeleton /> }
)
const ReactForm = dynamic(
  () => import('./react-form'),
  { ssr: false, loading: () => <TaskSkeleton /> }
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

  const submitTask = useCallback(async (data) => {
    setSubmitting(true);
    setError("");

    try {
      await completeTask(taskId, data);
      await onDone?.();
    } catch (err) {
      setError(err.message || "در ارسال اطلاعات خطایی رخ داد.");
    } finally {
      setSubmitting(false);
    }
  }, [onDone, taskId]);

  useEffect(() => {
    const loadTask = async () => {
      setLoading(true);
      setError("");
      setTask(undefined);

      try {
        setTask(await fetchTask(taskId));

      } catch (err) {
        setError(err.message || "خطایی در دریافت اطلاعات رخ داد.");
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      loadTask();
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
            onComplete={submitTask}
            submitting={submitting}
          />
        ) : (
          <ReactForm
            formKey={task.formKey}
            data={task.data}
            onComplete={submitTask}
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
