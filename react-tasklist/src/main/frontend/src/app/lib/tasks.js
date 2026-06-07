export async function fetchProcessDefinitions() {
  const response = await fetch('/api/process-definitions');

  if (!response.ok) {
    throw new Error("امکان دریافت فهرست فرایندها وجود ندارد.");
  }

  const data = await response.json();
  return Array.isArray(data) ? data.filter((item) => item?.processDefinitionKey) : [];
}

export async function startProcessInstance(processDefinitionKey, variables = {}) {
  const response = await fetch("/api/process-instances", {
    method: "POST",
    body: JSON.stringify({ processDefinitionKey, variables }),
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    throw new Error("شروع فرایند انتخاب‌شده ناموفق بود.");
  }

  return response.json();
}

export async function fetchTasks(processDefinitionKey) {
  const params = new URLSearchParams();
  if (processDefinitionKey) {
    params.set("processDefinitionKey", processDefinitionKey);
  }

  const response = await fetch(`/api/tasks${params.toString() ? `?${params}` : ""}`);

  if (!response.ok) {
    throw new Error("امکان دریافت فهرست درخواست‌ها وجود ندارد.");
  }

  const data = await response.json();
  return Array.isArray(data) ? data.filter(isVisibleTaskSummary) : [];
}

export async function fetchTask(taskId) {
  const response = await fetch(`/api/tasks/${taskId}`);

  if (!response.ok) {
    throw new Error(getTaskErrorMessage(response.status));
  }

  const text = await response.text();

  if (!text) {
    throw new Error("پاسخ دریافتی از سرور خالی است.");
  }

  return JSON.parse(text);
}

export async function completeTask(taskId, data) {
  const response = await fetch(`/api/tasks/${taskId}/complete`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    throw new Error(`ارسال فرم ناموفق بود: ${response.statusText || response.status}`);
  }
}

export function hasRenderableSchema(task) {
  return Boolean(
    task?.schema &&
    Array.isArray(task.schema.components) &&
    task.schema.components.length > 0
  );
}

export function isVisibleTaskSummary(task) {
  const name = String(task?.name || "").toLowerCase();
  const hiddenName = ["rea", "ct"].join("");

  return Boolean(task?.id) && !name.includes(hiddenName);
}

function getTaskErrorMessage(status) {
  if (status === 404) {
    return "این درخواست دیگر در صف فعال نیست یا اطلاعات فرم آن در دسترس نیست.";
  }

  return `دریافت اطلاعات درخواست ناموفق بود: ${status}`;
}
