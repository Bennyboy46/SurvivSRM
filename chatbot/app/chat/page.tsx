import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ChatClient from "@/components/ChatClient";
import {
  fetchBackendJson,
  normalizeBackendPayload,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/server";

type TimetableSlot = {
  code?: string;
  name?: string;
  slot?: string;
  roomNo?: string;
};

type TimetableDay = {
  day?: number;
  table?: Array<TimetableSlot | null>;
};

type TimetableResponse = {
  batch?: string;
  schedule?: TimetableDay[];
  timetable?: {
    batch?: string;
    schedule?: TimetableDay[];
  };
};

type UserResponse = {
  name?: string;
  regNumber?: string;
  email?: string;
};

type UserIdentity = {
  name?: string;
  regNumber?: string;
  email?: string;
};

type LooseRecord = Record<string, unknown>;

function asRecord(value: unknown): LooseRecord | null {
  if (!value || typeof value !== "object") return null;
  return value as LooseRecord;
}

function dayNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/\d+/);
    if (!match) return undefined;
    const parsed = Number.parseInt(match[0], 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function normalizeSlot(value: unknown): TimetableSlot | null {
  const rec = asRecord(value);
  if (!rec) return null;

  const code = typeof rec.code === "string" ? rec.code : typeof rec.Code === "string" ? rec.Code : undefined;
  const name = typeof rec.name === "string" ? rec.name : typeof rec.Name === "string" ? rec.Name : undefined;
  const slot = typeof rec.slot === "string" ? rec.slot : typeof rec.Slot === "string" ? rec.Slot : undefined;
  const roomNo = typeof rec.roomNo === "string"
    ? rec.roomNo
    : typeof rec.RoomNo === "string"
      ? rec.RoomNo
      : undefined;

  if (!code && !name && !slot && !roomNo) return null;
  return { code, name, slot, roomNo };
}

function extractUserIdentity(payload: unknown): UserIdentity {
  const root = asRecord(payload);
  if (!root) return {};

  const unwrapped = asRecord(root.data) ?? root;
  const name = typeof unwrapped.name === "string"
    ? unwrapped.name
    : typeof unwrapped.Name === "string"
      ? unwrapped.Name
      : undefined;
  const regNumber = typeof unwrapped.regNumber === "string"
    ? unwrapped.regNumber
    : typeof unwrapped.RegNumber === "string"
      ? unwrapped.RegNumber
      : undefined;
  const email = typeof unwrapped.email === "string"
    ? unwrapped.email
    : typeof unwrapped.Email === "string"
      ? unwrapped.Email
      : undefined;

  return { name, regNumber, email };
}

function extractTimetable(payload: unknown): { batch?: string; schedule: TimetableDay[] } {
  const root = asRecord(payload);
  if (!root) return { schedule: [] };

  const unwrapped = asRecord(root.data) ?? root;
  const batch = typeof unwrapped.batch === "string" ? unwrapped.batch : undefined;
  const scheduleRaw = Array.isArray(unwrapped.schedule)
    ? unwrapped.schedule
    : Array.isArray((asRecord(unwrapped.timetable)?.schedule))
      ? (asRecord(unwrapped.timetable)?.schedule as unknown[])
      : [];

  const schedule = scheduleRaw.reduce<TimetableDay[]>((acc, row) => {
    const rowRec = asRecord(row);
    if (!rowRec) return acc;

    const day = dayNumber(rowRec.day ?? rowRec.dayOrder ?? rowRec.DayOrder);
    const tableRaw = Array.isArray(rowRec.table)
      ? rowRec.table
      : Array.isArray(rowRec.slots)
        ? rowRec.slots
        : [];

    const table = tableRaw.map((entry) => normalizeSlot(entry));
    if (typeof day === "number") {
      acc.push({ day, table });
    }
    return acc;
  }, []);

  return { batch, schedule };
}

export default async function ChatPage() {
  const session = verifySessionToken((await cookies()).get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    redirect("/");
  }

  const timetableRes = await fetchBackendJson("/timetable", session);
  const userRes = await fetchBackendJson("/user", session);
  if (!timetableRes.ok || (timetableRes.status === 401 || timetableRes.status === 404)) {
    redirect("/");
  }
  if (!userRes.ok || (userRes.status === 401 || userRes.status === 404)) {
    redirect("/");
  }

  const parsed = extractTimetable(normalizeBackendPayload<TimetableResponse>(timetableRes.data) ?? timetableRes.data);
  const user = extractUserIdentity(normalizeBackendPayload<UserResponse>(userRes.data) ?? userRes.data);

  return <ChatClient schedule={parsed.schedule} batch={parsed.batch} user={user} />;
}
