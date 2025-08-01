// Centralized error handling utility
export const handleApiError = (error, customMessage = "An error occurred") => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error || customMessage;
    
    switch (status) {
      case 401:
        localStorage.removeItem("token");
        window.location.href = "/auth";
        return "Session expired. Please login again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "Resource not found.";
      case 422:
        return message || "Invalid data provided.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return message || customMessage;
    }
  } else if (error.request) {
    // Network error
    return "Network error. Please check your connection.";
  } else {
    // Other error
    return error.message || customMessage;
  }
};

export const showError = (error, setMessage) => {
  const errorMessage = handleApiError(error);
  setMessage(errorMessage);
  console.error("API Error:", error);
};

export const showSuccess = (message, setMessage) => {
  setMessage(message);
  setTimeout(() => setMessage(""), 5000);
}; 