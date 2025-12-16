import { StatusCodes } from "http-status-codes";
import { AppError } from "../../middleware/AppError.js";
import axios from "axios";

const createPayment = async(payload:any) => {
 
   try{
     const data = {
        total_amount: 100,
        currency: 'BDT',
        tran_id: 'REF123', // use unique tran_id for each api call
        success_url: 'http://localhost:3030/success',
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
   const response = await axios({
            method: 'post',
            url: '',
            data: data,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        return response;

   }catch(err) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'faild payment')
   }


}

const validatePayment = async (payload: any) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `${'config.ssl.sslValidationApi'}?val_id=${payload.val_id}&store_id=${'config.ssl.storeId'}&store_passwd=${'config.ssl.storePass'}&format=json`
        });

        return response.data;
    }
    catch (err) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Payment validation failed!")
    }
}

export const sslServices = {
    createPayment,
    validatePayment
}