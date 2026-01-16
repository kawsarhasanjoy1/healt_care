import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });
export default {
    node_env: process.env.NODE_ENV || 'development',
    database_url: process.env.DATABASE_URL,
    access_secret: process.env.ACCESS_SECRET,
    access_expirein: process.env.ACCESS_EXPIREIN,
    refresh_secret: process.env.REFRESH_SECRET,
    refresh_expirein: process.env.REFRESH_EXPIREIN,
    app_pass: process.env.APP_PASS,
    app_gmail: process.env.APP_GMAIL,
    front_end_url: process.env.FRONT_END_LINK,
    forgot_secret: process.env.FORGOT_SECRET,
    forgot_expireIn: process.env.FORGOT_EXPIREIN,
    cloud_api_key: process.env.CLOUD_API_KEY,
    cloud_secret: process.env.CLOUD_SECRET,
    cloud_name: process.env.CLOUD_NAME,
    store_id: process.env.STORE_ID,
    store_pass: process.env.STORE_PASS,
    success_url: process.env.SUCCESS_URL,
    fail_url: process.env.FAIL_URL,
    cancel_url: process.env.CANCEL_URL,
    ssl_payment_api: process.env.SSL_PAYMENT_API,
    validation_api: process.env.VALIDATION_API
};
