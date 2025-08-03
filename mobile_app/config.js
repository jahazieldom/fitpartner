// config.js
const ENV = {
  dev: { 
    API_BASE_URL: "http://192.168.1.8:8000",
    TENANT_API_BASE_URL: "http://192.168.1.8:8000",
    LOCAL_DEVELOPMENT: true,
  },
  prod: { 
    API_BASE_URL: "https://muvon.me",
    TENANT_API_BASE_URL: "https://__SCHEMA__.muvon.me",
    LOCAL_DEVELOPMENT: false,
  },
};

const getEnvVars = (env = "") => (env === "prod" ? ENV.prod : ENV.dev);

export default getEnvVars(__DEV__ ? "dev" : "prod");
