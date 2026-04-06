import { cookies } from "next/headers";
import Groq from "groq-sdk";
import {
  fetchBackendJson,
  GROQ_API_KEY,
  genericFailure,
  normalizeBackendPayload,
  secureMessageResponse,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/server";

type CalendarDay = {
  date?: string;
  day?: string;
  event?: string;
  dayOrder?: string;
};

type CalendarMonth = {
  month?: string;
  days?: CalendarDay[];
};

type CalendarPayload = {
  today?: CalendarDay | null;
  tomorrow?: CalendarDay | null;
  index?: number;
  calendar?: CalendarMonth[];
};

type RouteBody = { m?: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCalendarDay(value: unknown): CalendarDay | null {
  const rec = asRecord(value);
  if (!rec) return null;

  const date = asText(rec.date);
  const day = asText(rec.day);
  const event = asText(rec.event);
  const dayOrder = asText(rec.dayOrder);

  if (!date && !day && !event && !dayOrder) return null;
  return { date, day, event, dayOrder };
}

function normalizeCalendarPayload(value: unknown): CalendarPayload | null {
  const rec = asRecord(value);
  if (!rec) return null;

  const today = normalizeCalendarDay(rec.today);
  const tomorrow = normalizeCalendarDay(rec.tomorrow);
  const index = typeof rec.index === "number" ? rec.index : 0;
  const monthsRaw = Array.isArray(rec.calendar) ? rec.calendar : [];

  const calendar = monthsRaw.reduce<CalendarMonth[]>((acc, monthValue) => {
    const monthRec = asRecord(monthValue);
    if (!monthRec) return acc;

    const daysRaw = Array.isArray(monthRec.days) ? monthRec.days : [];
    const days = daysRaw
      .map((dayValue) => normalizeCalendarDay(dayValue))
      .filter((day): day is CalendarDay => day !== null);

    acc.push({ month: asText(monthRec.month), days });
    return acc;
  }, []);

  return { today, tomorrow, index, calendar };
}

function formatDayLine(label: string, day: CalendarDay | null | undefined): string {
  if (!day) return `${label}: Not available`;

  const order = asText(day.dayOrder) || "Not available";
  const datePart = [day.day, day.date].filter(Boolean).join(" ").trim();
  const eventPart = asText(day.event);

  if (!datePart) {
    return `${label}: Day Order ${order}${eventPart ? ` | ${eventPart}` : ""}`;
  }

  return `${label}: Day Order ${order} | ${datePart}${eventPart ? ` | ${eventPart}` : ""}`;
}

function dayToNumber(value?: string): number {
  const n = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : -1;
}

function getUpcomingEvents(payload: CalendarPayload, limit = 6): string[] {
  const calendar = Array.isArray(payload.calendar) ? payload.calendar : [];
  if (!calendar.length) return [];

  const startIndex = Math.max(0, Math.min(payload.index ?? 0, calendar.length - 1));
  const todayDate = dayToNumber(payload.today?.date);
  const upcoming: string[] = [];

  for (let i = startIndex; i < calendar.length && upcoming.length < limit; i += 1) {
    const month = calendar[i];
    const monthLabel = month.month?.trim() || "Unknown month";
    const days = Array.isArray(month.days) ? month.days : [];

    for (const day of days) {
      if (upcoming.length >= limit) break;
      if (!day) continue;

      if (i === startIndex && todayDate > 0) {
        const d = dayToNumber(day.date);
        if (d > 0 && d <= todayDate) continue;
      }

      const event = asText(day.event);
      if (!event) continue;

      const dateLabel = [day.day, day.date, monthLabel].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      const dayOrder = asText(day.dayOrder);
      const orderText = dayOrder ? ` | Day Order ${dayOrder}` : "";
      upcoming.push(`${dateLabel}: ${event}${orderText}`);
    }
  }

  return upcoming;
}

function buildGetResponse(message: string, payload: CalendarPayload): string {
  const query = message.replace(/^\s*\/get\b/i, "").trim().toLowerCase();
  const todayLine = formatDayLine("Today", payload.today);
  const tomorrowLine = formatDayLine("Tomorrow", payload.tomorrow);
  const upcoming = getUpcomingEvents(payload, 6);
  const monthName = payload.calendar?.[payload.index ?? 0]?.month?.trim() || "Not available";

  if (query.startsWith("today")) return todayLine;
  if (query.startsWith("tomorrow")) return tomorrowLine;
  if (query.includes("day") && query.includes("order")) return `${todayLine}\n${tomorrowLine}`;
  if (query.includes("holiday") || query.includes("event")) {
    return upcoming.length ? `Upcoming holiday/event entries:\n- ${upcoming.join("\n- ")}` : "No upcoming holiday/event entries found in the calendar.";
  }

  return `Calendar snapshot (Month: ${monthName})\n${todayLine}\n${tomorrowLine}\n\n${upcoming.length ? `Upcoming holiday/event entries:\n- ${upcoming.join("\n- ")}` : "No upcoming holiday/event entries found in the calendar."}`;
}

function getCurrentContext() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
  }).format(now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  return { date, time, year: now.getFullYear() };
}

const groq = new Groq({ apiKey: GROQ_API_KEY });
const modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const systemPrompt = process.env.SYSTEM_PROMPT || "";

export async function POST(req: Request) {
  try {
    const token = verifySessionToken((await cookies()).get(SESSION_COOKIE_NAME)?.value);
    if (!token) {
      return secureMessageResponse("Request failed", 401);
    }

    const body = (await req.json()) as RouteBody;
    const message = typeof body.m === "string" ? body.m.trim() : "";
    if (!message) {
      return secureMessageResponse("Request failed", 400);
    }

    const [attendance, marks, timetable, calendar, user] = await Promise.all([
      fetchBackendJson("/attendance", token),
      fetchBackendJson("/marks", token),
      fetchBackendJson("/timetable", token),
      fetchBackendJson("/calendar", token),
      fetchBackendJson("/user", token),
    ]);

    const expired = [attendance, marks, timetable, calendar, user].some((result) => result.status === 401 || result.status === 404);
    if (expired) {
      return secureMessageResponse("Request failed", 401);
    }

    const currentContext = getCurrentContext();
    const attendancePayload = normalizeBackendPayload(attendance.data);
    const marksPayload = normalizeBackendPayload(marks.data);
    const timetablePayload = normalizeBackendPayload(timetable.data);
    const calendarPayload = normalizeBackendPayload(calendar.data);
    const userPayload = normalizeBackendPayload(user.data);

    if (/^\s*\/get\b/i.test(message)) {
      const normalizedCalendar = normalizeCalendarPayload(calendarPayload);
      if (!normalizedCalendar) {
        return secureMessageResponse("Request failed", 200);
      }
      return secureMessageResponse(buildGetResponse(message, normalizedCalendar), 200);
    }

    const prompt = `Current context:\n- Date: ${currentContext.date}\n- Time: ${currentContext.time}\n- Year: ${currentContext.year}\n\nStudent data:\n- User: ${JSON.stringify(userPayload, null, 2)}\n- Attendance: ${JSON.stringify(attendancePayload, null, 2)}\n- Marks: ${JSON.stringify(marksPayload, null, 2)}\n- Timetable: ${JSON.stringify(timetablePayload, null, 2)}\n- Calendar: ${JSON.stringify(calendarPayload, null, 2)}\n\nUser message:\n${message}`;

    const result = await groq.chat.completions.create({
      model: modelName,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const text = result.choices[0]?.message?.content?.trim() ?? "";
    return secureMessageResponse(text || "Request failed", 200);
  } catch (error) {
    const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("[/api/q] Request failed", details);
    return secureMessageResponse("Request failed", 500);
  }
}
