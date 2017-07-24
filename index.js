var express = require('express');
var app = express();
var bodyParser = require('body-parser');


app.set('port', (process.env.PORT || 5000));

//app.use(express.static(__dirname + '/public'));
/*app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
*/

app.get('/', function(req, res) {
console.log('reached get');   
    console.log(req.query);
    res.send('Hello world get' + req.query);
});

app.post('/', function(req, res) {
console.log('reached post'); 
    console.log(req.body);
    res.send('Hello world post');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
