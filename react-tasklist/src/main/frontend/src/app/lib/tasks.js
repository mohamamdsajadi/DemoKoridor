export async function fetchTasks() {
  const response = await fetch('/api/tasks');

  if (!response.ok) {
    throw new Error("امکان دریافت فهرست درخواست‌ها وجود ندارد.");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
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

function getTaskErrorMessage(status) {
  if (status === 404) {
    return "این درخواست دیگر در صف فعال نیست یا اطلاعات فرم آن در دسترس نیست.";
  }

  return `دریافت اطلاعات درخواست ناموفق بود: ${status}`;
}
