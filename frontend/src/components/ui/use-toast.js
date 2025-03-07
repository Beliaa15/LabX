import { toast } from 'react-toastify';

export const useToast = () => {
  const notify = (message, options = {}) => toast(message, options);

  return {
    toast: ({ title, description, variant = "default" }) => {
      notify(
        <div>
          <strong>{title}</strong>
          <div>{description}</div>
        </div>,
        { type: variant === "destructive" ? "error" : "default" }
      );
    },
  };
};
