type Environment = 'local' | 'production';

const ENV: Environment = (import.meta.env.VITE_ENV as Environment) || 'local';

const config = {
  local: {
    apiUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://gateway-api-1j5h.onrender.com',
  },
};

export default config[ENV];
