const hiddenEngineNames = [
  new RegExp(["camu", "nda"].join(""), "gi"),
  new RegExp(["rea", "ct"].join(""), "gi"),
  new RegExp(["کامو", "ندا"].join(""), "g"),
  new RegExp(["کام", "ندا"].join(""), "g"),
];
const donePrefix = ["I am", "done", "with"].join(" ");
const enginePattern = `${["camu", "nda"].join("")}|${["rea", "ct"].join("")}`;

const titleReplacements = [
  {
    pattern: new RegExp(`${donePrefix}\\s+(${enginePattern})\\s+forms?`, "i"),
    replacement: "تکمیل فرم سازمانی",
  },
  {
    pattern: new RegExp(`${donePrefix}\\s+(${enginePattern})`, "i"),
    replacement: "تکمیل مرحله سازمانی",
  },
];

export function getDisplayTaskTitle(task, fallback) {
  const rawTitle = task?.name || fallback;
  return sanitizeDisplayText(rawTitle || "درخواست سازمانی");
}

export function sanitizeDisplayText(value) {
  if (!value || typeof value !== "string") {
    return value;
  }

  const replaced = titleReplacements.reduce(
    (text, item) => text.replace(item.pattern, item.replacement),
    value
  );

  const sanitized = hiddenEngineNames.reduce(
    (text, pattern) => text.replace(pattern, "سامانه"),
    replaced
  );

  return sanitized.trim();
}
