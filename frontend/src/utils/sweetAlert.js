import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

// Base configuration for alerts
const baseConfig = {
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: document.documentElement.classList.contains('dark') ? '#2A2A2A' : '#fff',
  color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
};

// Success alert
export const showSuccessAlert = (title, text) => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'success',
  });
};

// Error alert
export const showErrorAlert = (title, text) => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'error',
  });
};

// Warning alert
export const showWarningAlert = (title, text) => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'warning',
  });
};

// Info alert
export const showInfoAlert = (title, text) => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'info',
  });
};

// Confirmation dialog
export const showConfirmDialog = (title, text, confirmButtonText = 'Yes', cancelButtonText = 'No') => {
  return MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    background: document.documentElement.classList.contains('dark') ? '#2A2A2A' : '#fff',
    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    confirmButtonColor: '#3B82F6',
    cancelButtonColor: '#EF4444',
  });
};

// Loading alert
export const showLoadingAlert = (title = 'Loading...') => {
  return MySwal.fire({
    title,
    allowOutsideClick: false,
    showConfirmButton: false,
    background: document.documentElement.classList.contains('dark') ? '#2A2A2A' : '#fff',
    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    didOpen: () => {
      MySwal.showLoading();
    },
  });
};

// Close all alerts
export const closeAlert = () => {
  MySwal.close();
};

// Custom alert with more options
export const showCustomAlert = (config) => {
  return MySwal.fire({
    ...baseConfig,
    ...config,
  });
}; 