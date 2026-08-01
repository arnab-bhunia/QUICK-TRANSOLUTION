export function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({ message: "That record already exists" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  // Everything else (DB timeouts, driver errors, bugs) is logged in full
  // above but NEVER shown to the client verbatim — raw error text can
  // leak internal details (db/collection names, driver internals) and
  // isn't written for a visitor to read anyway.
  res.status(err.status || 500).json({
    message: "Something went wrong on our end. Please try again shortly.",
  });
}