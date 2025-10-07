export function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatYYYYMMDD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function getNextBusinessDay(from: Date = new Date()): Date {
  const day = from.getDay(); // 0 Sun, 1 Mon, ... 6 Sat
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let add = 1;
  if (day === 5) add = 3; // Friday -> Monday
  else if (day === 6) add = 2; // Saturday -> Monday
  else if (day === 0) add = 1; // Sunday -> Monday
  else add = 1; // Monday to Thursday -> next day
  next.setDate(next.getDate() + add);
  return next;
}

export function getNextBusinessDayString() {
  return formatYYYYMMDD(getNextBusinessDay());
}

export function generateHourOptions(start: string, end: string): string[] {
  const [sh, sm] = start.split(":").map((v) => parseInt(v, 10));
  const [eh, em] = end.split(":").map((v) => parseInt(v, 10));
  const startMin = sh * 60 + (isNaN(sm) ? 0 : sm);
  const endMin = eh * 60 + (isNaN(em) ? 0 : em);
  const STEP = 40; // minutes
  const opts: string[] = [];
  for (let m = startMin; m <= endMin; m += STEP) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    opts.push(`${pad2(h)}:${pad2(mm)}`);
  }
  return opts;
}
