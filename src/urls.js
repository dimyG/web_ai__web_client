// The proxy directive in package.json can be removed. We use env variables to set the API service urls
const auth_server = process.env.REACT_APP_AUTH_API_SERVICE;
const text_to_img_server = process.env.REACT_APP_TEXT_TO_IMG_API_SERVICE;
const payment_server = process.env.REACT_APP_PAYMENTS_API_SERVICE;

const urls = {
  auth: {
    login: auth_server + 'api/auth/login/',
    register: auth_server + 'api/auth/registration/',
    logout: auth_server + 'api/auth/logout/',
    forgotPassword: auth_server + 'api/auth/password/change/',
    resetPassword: auth_server + 'api/auth/password/reset/',
    verifyEmail: auth_server + 'api/auth/registration/verify-email/',
    refreshToken: auth_server + 'api/auth/token/refresh/',
    user: auth_server + 'api/auth/users/',
  },
  ai_tools: {
    // text_to_img: text_to_img_server + 'generate_image/',
    initiate_run: text_to_img_server + 'initiate_run/',
    runpod_run: 'https://api.runpod.ai/v1/v9zir5v2o6ezbl/run',
    runpod_status: 'https://api.runpod.ai/v1/v9zir5v2o6ezbl/status/',
  },
  payments: {
    create: payment_server + 'api/payments/',
  }
}

export default urls
