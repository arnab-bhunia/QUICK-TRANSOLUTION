import Office from "../models/Office.js";

// Resolves office codes -> names from MongoDB for display. Historical
// assignments still resolve even when the office is inactive.
export async function getOfficeNameMap(codes) {
  const unique = [...new Set(codes.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const offices = await Office.find({ code: { $in: unique } }).select("code name").lean();
  return new Map(offices.map((o) => [o.code, o.name]));
}
