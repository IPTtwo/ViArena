export const dateText = (v, opts = {}) =>
  v
    ? new Date(v).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...opts,
      })
    : 'Not set';
export const dateTimeText = (v) =>
  v
    ? new Date(v).toLocaleString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Not set';
