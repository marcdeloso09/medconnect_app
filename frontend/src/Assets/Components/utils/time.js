// Converts "HH:MM" → "h:mm AM/PM"
export function formatTime12h(time24) {
  if (!time24) return "Time N/A";

  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}
