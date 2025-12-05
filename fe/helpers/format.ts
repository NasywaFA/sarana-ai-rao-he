export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (date: string | Date): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Convert to Date object if string is provided
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Convert to Asia/Jakarta timezone
  const jakartaDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

  const day = jakartaDate.getDate();
  const month = months[jakartaDate.getMonth()];
  const year = jakartaDate.getFullYear();
  const hours = jakartaDate.getHours().toString().padStart(2, '0');
  const minutes = jakartaDate.getMinutes().toString().padStart(2, '0');

  return `${day} ${month} ${year} - ${hours}:${minutes} WIB`;
}; 