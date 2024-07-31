// services/historialService.js
import axios from 'axios';

const { API_URL } = require("@/constants/index");
export const getAllHistorial = async (token) => {
    let headers = {
        headers: {
            "Accept": "application/json",
        }
    }
    if (token !== "NONE") {
        headers = {
            headers: {
                "Accept": "application/json",
                "X-Access-Token": token
            }
        }
    }
    const { data } = await axios.get(`${API_URL}/data/all`, headers);
    return data;
};
