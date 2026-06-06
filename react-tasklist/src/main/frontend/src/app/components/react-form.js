'use client'

import { useMemo, useState } from "react";

export default function ReactForm({ data = {}, onComplete, submitting }) {
  const initialValues = useMemo(() => data && typeof data === "object" ? data : {}, [data]);
  const [values, setValues] = useState(initialValues);
  const entries = Object.entries(values);

  const updateField = (key, value) => {
    setValues(current => ({ ...current, [key]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onComplete(values);
  };

  return (
    <form className="native-form" onSubmit={submit}>
      {entries.length === 0 ? (
        <label className="native-field">
          <span>توضیحات درخواست</span>
          <textarea
            value={values.description || ""}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="اطلاعات تکمیلی را وارد کنید"
          />
        </label>
      ) : (
        entries.map(([key, value]) => (
          <label className="native-field" key={key}>
            <span>{key}</span>
            <input
              value={value ?? ""}
              onChange={(event) => updateField(key, event.target.value)}
            />
          </label>
        ))
      )}

      <button className="cf-submit-btn" type="submit" disabled={submitting}>
        {submitting ? 'در حال ارسال...' : 'ارسال برای بررسی'}
      </button>
    </form>
  );
}
