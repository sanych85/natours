import axios from 'axios';
import { showAlert } from './alerts';
// export const signUp = async () => {
//     try {
//       await axios({
//         method: 'GET',
//         url: 'http://localhost:3000/api/v1/users/signup',
//       });
//     } catch (err) {
//       console.log(err.response);
//       showAlert('error', 'Error logging out! Try again.');
//     }
//   };

  export const signUp = async (email, password,name,passwordConfirm) => {
     
    try {
      const res = await axios({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/users/signup',
        data: {
        name,
          email,
          password,
          passwordConfirm
        },
      });
  
      if (res.data.status === 'success') {
        showAlert('success', 'Sign up successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  };