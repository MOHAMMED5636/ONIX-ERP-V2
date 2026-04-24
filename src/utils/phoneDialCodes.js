import phoneDialCodes from "../data/phoneDialCodes.json";

/** All country/territory dial codes for dropdowns (sorted A–Z by country name). */
export const PHONE_DIAL_CODE_OPTIONS = phoneDialCodes;

/** Default UAE (+971) — unique value for `<select>` (same dial code can appear for multiple countries). */
export const DEFAULT_PHONE_OPTION_VALUE = (() => {
  const o = phoneDialCodes.find((x) => x.code === "+971");
  return o ? `${o.code}|${o.name}` : "+971|United Arab Emirates";
})();

export function dialCodeFromPhoneOption(optionValue) {
  const s = String(optionValue || "");
  const i = s.indexOf("|");
  return i >= 0 ? s.slice(0, i) : "+971";
}

/** Pick the matching dropdown row for a dial code like "+91" (first country in list with that code). */
export function phoneOptionFromDialCode(code) {
  if (!code) return DEFAULT_PHONE_OPTION_VALUE;
  const found = phoneDialCodes.find((o) => o.code === code);
  return found ? `${found.code}|${found.name}` : `${code}|`;
}

/**
 * Unique dial codes, longest first — used to split "+971501234567" into code + national number.
 */
const DIAL_CODES_LONGEST_FIRST = (() => {
  const seen = new Set();
  const list = [];
  for (const row of phoneDialCodes) {
    const d = String(row.dialCode || "");
    if (!d || seen.has(d)) continue;
    seen.add(d);
    list.push(d);
  }
  list.sort((a, b) => b.length - a.length);
  return list;
})();

/**
 * Parse a stored phone like "+971 50 123 4567" or "+919876543210" into dial code and national digits.
 */
/** Join selected dial code and national digits for API storage. */
export function formatInternationalPhone(code, number) {
  const c = String(code || "").trim();
  const n = String(number || "").trim();
  if (!c) return n;
  if (!n) return c;
  return `${c} ${n}`;
}

export function parseInternationalPhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return { code: "", nationalNumber: "" };

  const digits = raw.replace(/\D/g, "");
  if (!digits) return { code: "", nationalNumber: "" };

  if (raw.startsWith("+") || /^\+?\d/.test(raw)) {
    for (const dc of DIAL_CODES_LONGEST_FIRST) {
      if (digits.startsWith(dc)) {
        const national = digits.slice(dc.length).replace(/^0+/, "");
        return { code: `+${dc}`, nationalNumber: national };
      }
    }
  }

  return { code: "", nationalNumber: raw };
}
