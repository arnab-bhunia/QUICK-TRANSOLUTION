const REPORTING_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 330;

function istDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORTING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function istMidnightUtc(year, month, day) {
  // The reporting day begins at 00:00 Asia/Kolkata (UTC+05:30).
  return new Date(Date.UTC(year, month - 1, day) - IST_OFFSET_MINUTES * 60_000);
}

function dayShift(year, month, day, amount) {
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function resolveAnalyticsRange(query = {}, now = new Date()) {
  const period = String(query.period || "30d").toLowerCase();
  const today = istDateParts(now);
  let start;
  let end;
  const labels = { today: "Today", yesterday: "Yesterday", "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", this_month: "This month", previous_month: "Previous month", this_quarter: "This quarter", this_year: "This year" };
  let label = labels[period] || period;

  if (period === "custom") {
    const startText = String(query.start || "");
    const endText = String(query.end || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startText) || !/^\d{4}-\d{2}-\d{2}$/.test(endText)) {
      const error = new Error("Custom date ranges require start and end in YYYY-MM-DD format.");
      error.status = 400;
      throw error;
    }
    const [sy, sm, sd] = startText.split("-").map(Number);
    const [ey, em, ed] = endText.split("-").map(Number);
    start = istMidnightUtc(sy, sm, sd);
    const nextEnd = dayShift(ey, em, ed, 1);
    end = istMidnightUtc(nextEnd.year, nextEnd.month, nextEnd.day);
    const startParts = istDateParts(new Date(start.getTime() + IST_OFFSET_MINUTES * 60_000));
    const endParts = istDateParts(new Date(end.getTime() - 86_400_000 + IST_OFFSET_MINUTES * 60_000));
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end ||
        `${startParts.year}-${startParts.month}-${startParts.day}` !== startText ||
        `${endParts.year}-${endParts.month}-${endParts.day}` !== endText) {
      const error = new Error("The custom date range is invalid.");
      error.status = 400;
      throw error;
    }
    if (end.getTime() - start.getTime() > 366 * 24 * 60 * 60 * 1000) {
      const error = new Error("Custom date ranges cannot exceed 366 days.");
      error.status = 400;
      throw error;
    }
    label = `${startText} to ${endText}`;
  } else {
    const { year, month, day } = { year: Number(today.year), month: Number(today.month), day: Number(today.day) };
    const currentDay = istMidnightUtc(year, month, day);
    if (period === "today") {
      start = currentDay;
      end = new Date(currentDay.getTime() + 86_400_000);
    } else if (period === "yesterday") {
      start = new Date(currentDay.getTime() - 86_400_000);
      end = currentDay;
    } else if (period === "7d" || period === "30d" || period === "90d") {
      const days = Number(period.slice(0, -1));
      start = new Date(currentDay.getTime() - (days - 1) * 86_400_000);
      end = new Date(currentDay.getTime() + 86_400_000);
    } else if (period === "this_month") {
      start = istMidnightUtc(year, month, 1);
      const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
      end = istMidnightUtc(next.year, next.month, 1);
    } else if (period === "previous_month") {
      const previous = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
      start = istMidnightUtc(previous.year, previous.month, 1);
      end = istMidnightUtc(year, month, 1);
    } else if (period === "this_quarter") {
      const firstMonth = Math.floor((month - 1) / 3) * 3 + 1;
      start = istMidnightUtc(year, firstMonth, 1);
      const nextMonth = firstMonth + 3;
      end = istMidnightUtc(year + Math.floor((nextMonth - 1) / 12), ((nextMonth - 1) % 12) + 1, 1);
    } else if (period === "this_year") {
      start = istMidnightUtc(year, 1, 1);
      end = istMidnightUtc(year + 1, 1, 1);
    } else {
      const error = new Error("Unsupported analytics period.");
      error.status = 400;
      throw error;
    }
  }

  const duration = end.getTime() - start.getTime();
  return {
    period,
    label,
    timeZone: REPORTING_TIME_ZONE,
    start,
    end,
    previousStart: new Date(start.getTime() - duration),
    previousEnd: start,
  };
}
