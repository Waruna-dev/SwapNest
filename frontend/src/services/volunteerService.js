// This service handles API calls related to volunteers.

// Example fetchVolunteers function
export const fetchVolunteers = async () => {
  try {
    const response = await fetch("/api/volunteers"); // Replace with your actual API endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch volunteers");
    }
    const result = await response.json();
    return result.success ? result.data : result;
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    throw error;
  }
};

// Fetch centers data
export const fetchCenters = async () => {
  try {
    const response = await fetch("/api/centers"); // Replace with your actual API endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch centers");
    }
    const result = await response.json();
    return result.success ? result.data : result;
  } catch (error) {
    console.error("Error fetching centers:", error);
    throw error;
  }
};

// Fetch the count of active centers
export const fetchActiveCentersCount = async () => {
  try {
    const response = await fetch("/api/centers/active/count"); // Replace with your actual API endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch active centers count");
    }
    const result = await response.json();
    return result.success ? result.count : result;
  } catch (error) {
    console.error("Error fetching active centers count:", error);
    throw error;
  }
};