const express = require('express');
const app = express();
const port = 3000;

app.use('/css',express.static(__dirname + '/css'));
app.use('/javascript',express.static(__dirname + '/public/javascript'));
app.use('/assets',express.static(__dirname + '/public/assets'));

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/index.html');
});

app.listen(port, () => {
    console.log('App running on port ' + port);
});

