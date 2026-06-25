export const formatDate = (value) => {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value)
  );
};

export const toDateInputValue = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

export const formatCurrency = (value) => {
  if (value === undefined || value === null || value === '') return 'Not set';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
};

export const daysUntil = (value) => {
  if (!value) return null;
  const today = new Date();
  const target = new Date(value);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
};
