const axios = require('axios').default;

axios.get('http://localhost').then((response) => {
    console.log(response.data);
}).catch((error) => {
    console.log(error);
})