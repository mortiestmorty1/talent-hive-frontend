import { toast } from 'react-toastify';

// Handle authentication errors from API responses
export const handleAuthError = (error, showToast = true, showModal = false) => {
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    const errorData = error.response.data;
    
    if (errorData?.code === 'AUTH_REQUIRED' || errorData?.code === 'INVALID_TOKEN') {
      // Show authentication prompt
      if (showToast) {
        toast.error(errorData.message || "Please login to continue", {
          autoClose: 5000,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
      
      // Show login modal if requested
      if (showModal) {
        // Trigger login modal - this will be handled by the component
        return {
          requiresAuth: true,
          showLoginModal: true,
          message: errorData.message || "Please login to continue",
          action: errorData.action || "login_required",
          requiredAction: errorData.requiredAction || null
        };
      }
      
      // Return authentication required signal
      return {
        requiresAuth: true,
        message: errorData.message || "Please login to continue",
        action: errorData.action || "login_required",
        requiredAction: errorData.requiredAction || null
      };
    }
  }
  
  return {
    requiresAuth: false,
    message: error?.response?.data?.message || error?.message || "An error occurred",
    action: null,
    requiredAction: null
  };
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const cookies = document.cookie;
  return cookies.includes('jwt=');
};

// Get authentication token
export const getAuthToken = () => {
  const cookies = document.cookie;
  const jwtMatch = cookies.match(/jwt=([^;]+)/);
  return jwtMatch ? jwtMatch[1] : null;
};

// Create axios config with optional auth
export const createAuthConfig = (config = {}) => {
  const token = getAuthToken();
  const authConfig = { ...config };
  
  if (token) {
    authConfig.headers = {
      ...authConfig.headers,
      Authorization: `Bearer ${token}`
    };
  }
  
  return authConfig;
};

// Handle API responses and show appropriate messages
export const handleApiResponse = (response, successMessage = null) => {
  if (response?.status >= 200 && response?.status < 300) {
    if (successMessage) {
      toast.success(successMessage);
    }
    return { success: true, data: response.data };
  }
  
  return { success: false, error: response };
};

// Common authentication prompts
export const showAuthPrompt = (action = "access this feature") => {
  toast.error(`Please login or signup to ${action}`, {
    autoClose: 5000,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

// Check authentication before performing actions
export const requireAuth = (action, showModalCallback = null) => {
  if (!isAuthenticated()) {
    if (showModalCallback) {
      // Show login modal
      showModalCallback();
    } else {
      // Show toast as fallback
      showAuthPrompt(action);
    }
    return false;
  }
  return true;
};

// Handle authentication for protected actions
export const handleProtectedAction = (action, callback, showModalCallback = null) => {
  if (requireAuth(action, showModalCallback)) {
    return callback();
  }
  return null;
};
