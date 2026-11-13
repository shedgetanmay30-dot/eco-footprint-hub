// Format carbon emission
export const formatEmission = (value) => {
  return `${Number(value || 0).toFixed(2)} kg CO₂e`;
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total) return 0;

  return ((value / total) * 100).toFixed(2);
};

// Capitalize first letter
export const capitalize = (text) => {
  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1);
};