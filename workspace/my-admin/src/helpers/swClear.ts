export const swClear = () =>
  navigator.serviceWorker
    .getRegistrations()
    .then((rs) => Promise.all(rs.map((r) => r.unregister())));
