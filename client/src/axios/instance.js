import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:7000',
  withCredentials: true, // Ensure cookies are sent with the request
  timeout: 10000,
});

// Attach a request interceptor to add the access token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 403 errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 403) {
      try {
        // Call the refresh endpoint (token sent automatically via cookies)
        const refreshResponse = await axios.post(
          '/refresh',
          {},
          {
            withCredentials: true, // Ensure cookies are sent
          }
        );

        // Update access token and retry the original request
        const newAccessToken = refreshResponse.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // Clone the original request and update the token
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
