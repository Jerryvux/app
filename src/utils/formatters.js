export const formatPrice = (price) => {
  return Number(price || 0).toLocaleString('vi-VN') + 'đ';
};

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


export const formatNumber = (number) => {
  return Number(number || 0).toLocaleString('vi-VN');
}; 