// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
    // Check for auth token in localStorage
    const token = localStorage.getItem('authToken');
    return !!token;  // Returns true if token exists, false otherwise
}

// Function to set authentication token
export const setAuthToken = (token: string): void => {
    if (!token) {
        console.error('Attempted to set null/undefined token');
        return;
    }
    console.log('Setting auth token:', token);
    localStorage.setItem('authToken', token);
}

// Function to remove authentication token (logout)
export const removeAuthToken = (): void => {
    localStorage.removeItem('authToken');
}
