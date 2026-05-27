export const STOCK_STATUS = {
  IN_STOCK: "in-stock",
  OUT_OF_STOCK: "out-of-stock",
  LAUNCHING_SOON: "launching-soon",
};

export const STOCK_STATUS_OPTIONS = [
  { value: STOCK_STATUS.IN_STOCK, label: "In Stock" },
  { value: STOCK_STATUS.OUT_OF_STOCK, label: "Out of Stock" },
  { value: STOCK_STATUS.LAUNCHING_SOON, label: "Launching Soon" },
];

const STOCK_STATUS_LABELS = STOCK_STATUS_OPTIONS.reduce((labels, option) => {
  labels[option.value] = option.label;
  return labels;
}, {});

export function normalizeStockStatus(value, legacyStock) {
  const raw = String(value || "").trim().toLowerCase();
  const compact = raw.replace(/[\s_]+/g, "-");

  if (compact === STOCK_STATUS.IN_STOCK || compact === "instock") {
    return STOCK_STATUS.IN_STOCK;
  }
  if (compact === STOCK_STATUS.OUT_OF_STOCK || compact === "outofstock") {
    return STOCK_STATUS.OUT_OF_STOCK;
  }
  if (compact === STOCK_STATUS.LAUNCHING_SOON || compact === "launchingsoon") {
    return STOCK_STATUS.LAUNCHING_SOON;
  }

  const numericStock = Number(legacyStock);
  if (Number.isFinite(numericStock)) {
    return numericStock > 0 ? STOCK_STATUS.IN_STOCK : STOCK_STATUS.OUT_OF_STOCK;
  }

  return STOCK_STATUS.IN_STOCK;
}

export function getStockStatusLabel(value, legacyStock) {
  return STOCK_STATUS_LABELS[normalizeStockStatus(value, legacyStock)];
}

export function isPurchasableStockStatus(value, legacyStock) {
  return normalizeStockStatus(value, legacyStock) === STOCK_STATUS.IN_STOCK;
}
