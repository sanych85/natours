import axios from 'axios'
import {showAlert} from "./alerts"

//type is either password or data
export const updateSettings = async (data,type)=> {
    try {
        const url = type==='password'?'http://localhost/api/v1/users/updateMypassword':'http://localhost/api/v1/users/updateMe'
        const res= await axios({
            method: 'PATCH',
            url,
            data
        })
        if(res.data.status==='success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`)
        }

    }
    catch(err) {
        console.log('errror',err)
        showAlert('error', err.response.data.message)
    }
}