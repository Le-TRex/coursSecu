
const express = require('express');
const app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
    res.send('wesh gros !');
});

const port = 3000;
app.listen(port,()=>{
    console.log(`Application écoute sur http://localhost:${port}`)
})