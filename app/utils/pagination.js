function pagination(page = 1, perPage = 20) {
  page = Math.max(1, Number(page) || 1);
  perPage = Math.min(100, Math.max(1, Number(perPage) || 20));
  return {
    page,
    perPage,
    offset: (page - 1) * perPage,
    limit: perPage
  };
}

module.exports = pagination;
