import axios from 'axios';

const API_BASE_URL = 'https://interview-report-ai.onrender.com';

export async function register({ username, email, password }) {

    try {
     const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
            username, email, password
          }, {
            withCredentials: true
          })

     return response.data

    } catch (error) {
        console.log(error)
    }

}


export async function login({ email, password }) {

    try {
     const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            email, password
          }, {
            withCredentials: true
          })
     return response.data
    } catch (error) {
        console.log(error)
    }
}


export async function logout() {

    try {
     const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
            withCredentials: true
          })
     return response.data
    } catch (error) {
        console.log(error)
    }
}


export async function getMe() {

    try {
     const response = await axios.get(`${API_BASE_URL}/api/auth/get-me`, {
            withCredentials: true
          })
     return response.data
    } catch (error) {
        console.log(error)
    }
}