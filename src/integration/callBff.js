// import { getToken } from '../Auth';

// provides an easy way for saga to call the BFF
const callBff = (suffix, type, body, returnJson = true) => {
 const payload = {};
 payload.method = type;
 payload.headers = {
   'Content-Type': 'application/json',
   // Authorization: `bearer ${getToken()}`,
 };

 if (body) {
   payload.body = JSON.stringify(body);
 }

 return fetch(`${process.env.REACT_APP_BFF_BASE_URL}/yumbff/${suffix}`, payload).then((response) => {
   if (response.ok) {
     if (returnJson) {
       return response.json();
     }
     return response;
   }
   throw Error(`Api request failed with status code: ${response.status}`);
 });
};

export default callBff;
