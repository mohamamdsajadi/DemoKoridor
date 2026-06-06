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
          throw new Error(`خطا در دریافت اطلاعات: ${response.status}`);
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
    <article className="task-card">
      <div className="task-card-header">
        <div className="task-title-block">
          <span className="task-index">{Number(order || 1).toLocaleString('fa-IR')}</span>
          <div>
            <p className="eyebrow">مرحله فعال</p>
            <h3>{task?.name || "در حال آماده‌سازی فرم"}</h3>
          </div>
        </div>
        <span className="status-pill">{submitting ? "در حال ارسال" : "آماده اقدام"}</span>
      </div>

      {error && <div className="notice error">{error}</div>}

      {loading ? (
        <div className="form-skeleton">
          <span />
          <span />
          <span />
        </div>
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
