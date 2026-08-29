import { useEffect, useRef, useState } from "react";
import "./DobPicker.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 120;

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate(); // month is 0-indexed here
}
function firstWeekdayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function formatDisplay(year, month, day) {
  return `${day} ${MONTHS[month]} ${year}`;
}
function toIso(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// value: "YYYY-MM-DD" string or "". onChange receives the same format.
export default function DobPicker({ value, onChange, required }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("days"); // "days" | "months" | "years"
  const wrapRef = useRef(null);
  const activeYearRef = useRef(null);

  const selected = value ? value.split("-").map(Number) : null; // [y, m(1-12), d]
  const today = new Date();

  // The month currently displayed in the grid — starts on the selected
  // date if there is one, otherwise a reasonable default (25 years back,
  // since most signups are adults) rather than the current month, which
  // would put a newborn's birth year one click away and an adult's
  // decades of clicking away.
  const [viewYear, setViewYear] = useState(selected ? selected[0] : today.getFullYear() - 25);
  const [viewMonth, setViewMonth] = useState(selected ? selected[1] - 1 : today.getMonth());

  useEffect(() => {
    function onOutsideClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setMode("days");
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  useEffect(() => {
    if (mode === "years" && activeYearRef.current) {
      activeYearRef.current.scrollIntoView({ block: "center" });
    }
  }, [mode]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const pickDay = (day) => {
    onChange(toIso(viewYear, viewMonth, day));
    setOpen(false);
    setMode("days");
  };

  const pickMonth = (monthIndex) => {
    setViewMonth(monthIndex);
    setMode("days");
  };

  const pickYear = (year) => {
    setViewYear(year);
    setMode("months");
  };

  const totalDays = daysInMonth(viewYear, viewMonth);
  const leadingBlanks = firstWeekdayOfMonth(viewYear, viewMonth);
  const yearList = Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => CURRENT_YEAR - i);

  return (
    <div className="dob-picker" ref={wrapRef}>
      <button
        type="button"
        className={`dob-picker-trigger ${!value ? "is-placeholder" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {selected ? formatDisplay(selected[0], selected[1] - 1, selected[2]) : "Select date of birth"}
      </button>
      {/* Keeps the surrounding <form>'s required-field validation working
          even though the visible control is a button, not a native input. */}
      <input type="hidden" value={value} required={required} />

      {open && (
        <div className="dob-picker-panel" role="dialog" aria-label="Choose date of birth">
          {mode === "days" && (
            <>
              <div className="dob-picker-header">
                <button type="button" onClick={goPrevMonth} aria-label="Previous month">
                  &lsaquo;
                </button>
                <button type="button" className="dob-picker-header-label" onClick={() => setMode("months")}>
                  {MONTHS[viewMonth]} {viewYear}
                </button>
                <button type="button" onClick={goNextMonth} aria-label="Next month">
                  &rsaquo;
                </button>
              </div>

              <div className="dob-picker-weekdays">
                {WEEKDAYS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>

              <div className="dob-picker-grid">
                {Array.from({ length: leadingBlanks }).map((_, i) => (
                  <span key={`blank-${i}`} />
                ))}
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                  const isSelected =
                    selected && selected[0] === viewYear && selected[1] - 1 === viewMonth && selected[2] === day;
                  return (
                    <button
                      type="button"
                      key={day}
                      className={`dob-picker-day ${isSelected ? "is-selected" : ""}`}
                      onClick={() => pickDay(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {mode === "months" && (
            <>
              <div className="dob-picker-header">
                <span />
                <button type="button" className="dob-picker-header-label" onClick={() => setMode("years")}>
                  {viewYear}
                </button>
                <span />
              </div>
              <div className="dob-picker-month-grid">
                {MONTHS.map((m, i) => (
                  <button
                    type="button"
                    key={m}
                    className={`dob-picker-month ${i === viewMonth ? "is-selected" : ""}`}
                    onClick={() => pickMonth(i)}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </>
          )}

          {mode === "years" && (
            <div className="dob-picker-year-list">
              {yearList.map((y) => (
                <button
                  type="button"
                  key={y}
                  ref={y === viewYear ? activeYearRef : null}
                  className={`dob-picker-year ${y === viewYear ? "is-selected" : ""}`}
                  onClick={() => pickYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}