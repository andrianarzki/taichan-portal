export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace(/\s+/g, ' ');
}

export function formatTimeWIB(isoString: string): string {
  try {
    const d = new Date(isoString);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} WIB`;
  } catch {
    return '00:00 WIB';
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const now = new Date().getTime();
    const then = new Date(isoString).getTime();
    const diffMins = Math.floor((now - then) / (1000 * 60));

    if (diffMins < 1) return 'baru saja';
    if (diffMins < 60) return `${diffMins} mnt lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  } catch {
    return '';
  }
}

export function formatDateIndonesian(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}
