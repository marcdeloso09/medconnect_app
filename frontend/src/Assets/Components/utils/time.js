// Converts "HH:MM" → "h:mm AM/PM"
export function formatTime12h(time24) {
  if (!time24) return "Time N/A";

  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Converts "YYYY-MM-DD" → "December 11, 2025"
export function formatDateLong(dateStr) {
  if (!dateStr) return "Date N/A";

  const date = new Date(dateStr);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
