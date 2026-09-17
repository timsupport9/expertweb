module.exports = (schema) => (req, res, next) => {
  try {
    const result = typeof schema === "function"
      ? schema(req)
      : schema;

    if (result === true || result == null) return next();

    return res.status(422).json({
      success: false,
      error: "Validation failed",
      details: result
    });
  } catch (error) {
    next(error);
  }
};
