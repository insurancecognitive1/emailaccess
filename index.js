var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var httpreq = require('request');
//var jsonreq = {"client_id": "c6f36595-cad5-4861-8dd7-b6849cab70bd","scope":"mail.read","code"="M130722b4-1c3d-72f7-2521-dada13ec9c89","client_secret"="X5gnN89guhOP6v6eyubQXwP","redirect_uri"="https://emailaccess.herokuapp.com/signin","grant_type"="authorization_code"}
const MicrosoftGraph = require("@microsoft/microsoft-graph-client");

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/ui'));

/*app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
*/

app.get('/signin', function(req, res) {
console.log('reached get');   
    console.log(req.query.code);
    var jsonreq = {grant_type:"authorization_code",client_id: "c6f36595-cad5-4861-8dd7-b6849cab70bd",scope:"mail.read",code:req.query.code,client_secret:"X5gnN89guhOP6v6eyubQXwP",redirect_uri:"https://emailaccess.herokuapp.com/signin"};
    console.log(jsonreq);
    httpreq({
    url: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    method: "POST",
    headers: {
        "content-type": "application/x-www-form-urlencoded",  // <--Very important!!!
    },
    form: jsonreq
    }, function (error, response, body){
        console.log('Error' ,error);
        //console.log('Response',response);
        console.log('Body',body);
        var bodyjson = JSON.parse(body);
        var tokenresponse=bodyjson.access_token;
        console.log('Token ',tokenresponse);
        getemail(tokenresponse,function(ret){
            console.log(ret);
            //res.send( ret.content);
               res.sendFile('ui/entity.html', { root : __dirname});

        });
        console.log('Completed');
        
    });
    
});

function getemail(tokenresponse,cb){
var client = MicrosoftGraph.Client.init({
        authProvider: (done) => {
        done(null, tokenresponse);
             }
            }); //first parameter takes an error if you can't get an access token 
        console.log('connected successfully');
    client
    .api('/me/messages')
    .get((err, res) => {
        if (err) {
            console.log(err)
            return;
        }
      
       res.value.forEach(function(jsonresp)
        {
           // console.log(jsonresp);
           // console.log('subject ',jsonresp.subject);
           //console.log('bodypreview ',jsonresp.bodyPreview);
           console.log('body ',jsonresp.body);
        });
        cb(res.value[0].body);
        
    });
}

app.get('/', function(req, res) {
console.log('reached get'); 
   // console.log(req.body);
    res.sendFile('ui/index.html', { root : __dirname});
});

app.post('/', function(req, res) {
console.log('reached post'); 
    console.log(req.body);
    res.send('Hello world post');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
