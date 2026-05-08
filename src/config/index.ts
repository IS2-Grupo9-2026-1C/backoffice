type Environment = 'local' | 'production';

const ENV: Environment = (import.meta.env.VITE_ENV as Environment) || 'local';

const config = {
  local: {
    apiUrl: 'http://127.0.0.1:8000',
  },
  production: {
    apiUrl: 'https://gateway-api-ih4e.onrender.com',
  },
};

export default config[ENV];
