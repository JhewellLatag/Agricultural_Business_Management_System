// api.js - iisang lugar para sa lahat ng tawag sa backend
async function request(path, options = {}) {
  const res = await fetch('/api' + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};

// Nagda-download ng file (PDF / Excel) galing sa backend
export async function downloadFile(path, body, filename) {
  const res = await fetch('/api' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Could not create the file.');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(await res.blob());
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// peso format, ginagamit sa lahat ng table
export const peso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });

// Petsa: ang DATE column ay "YYYY-MM-DD", kaya dinadagdagan ng oras para tama ang araw
export const fmtDate = (v) => {
  if (!v) return '-';
  const s = String(v);
  return (s.length === 10 ? new Date(s + 'T00:00:00') : new Date(s)).toLocaleDateString();
};
