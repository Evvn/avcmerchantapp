// import { getToken } from '../Auth';

// provides an easy way for saga to call airtable
const callAirtable = (suffix, type, body, returnJson = true) => {
 const payload = {};
 payload.method = type;
 payload.headers = {
   'Content-Type': 'application/json',
   Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`
 };

 if (body) {
   payload.body = JSON.stringify(body);
 }

 return fetch(`https://api.airtable.com/v0/app4XnP7NuSCWMWD7/Orders/${suffix}`, payload).then((response) => {
   if (response.ok) {
     if (returnJson) {
       return response.json();
     }
     return response;
   }
   console.log(response.json().then(error => console.log(error)))
   throw Error(`Api request failed with status code: ${response.status}`);
 });
};

export default callAirtable;
