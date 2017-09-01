var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var httpreq = require('request');
//var jsonreq = {"client_id": "c6f36595-cad5-4861-8dd7-b6849cab70bd","scope":"mail.read","code"="M130722b4-1c3d-72f7-2521-dada13ec9c89","client_secret"="X5gnN89guhOP6v6eyubQXwP","redirect_uri"="https://emailaccess.herokuapp.com/signin","grant_type"="authorization_code"}
const MicrosoftGraph = require("@microsoft/microsoft-graph-client");

//global variable
var rawemail = "";
var emailtoken = "";
var model_id = "";
var api_key = "";

const watson = require('watson-developer-cloud');
const natural_language_classifier = watson.natural_language_classifier({
  username: 'e122adbe-5489-48b8-9c6c-222ae7a72d1d',
  password: 'ShXws2ujrNaE',
  version: 	'v1'
});
var conversation = watson.conversation({
  username: 'dccf3bfa-6e72-4589-a66d-1089784818cc',
  password: 'lENF1ZsL51Sp',
  version: 'v1',
  version_date: '2017-04-21'
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/ui'));
app.use(bodyParser());

/*app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
*/

app.get('/signin', function(req, res) {
    console.log('reached get'); 
    console.log(req.query.code);
    var jsonreq = {grant_type:"authorization_code",client_id: "c6f36595-cad5-4861-8dd7-b6849cab70bd",scope:"mail.readwrite",code:req.query.code,client_secret:"X5gnN89guhOP6v6eyubQXwP",redirect_uri:"https://emailaccess.herokuapp.com/signin"};
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
	emailtoken = tokenresponse; //global variable - it will be used in client side
	var emailcount = 0;
        getemail(tokenresponse,emailcount,function(ret){
            console.log(ret);
            //res.send( ret.content);
            rawemail = ret.content;
            res.sendFile('ui/entity.html', { root : __dirname});
        });
        console.log('Completed');        
    });    
});

function getemail(tokenresponse,emailcount,cb){
var client = MicrosoftGraph.Client.init({
        authProvider: (done) => {
        done(null, tokenresponse);
             }
            }); //first parameter takes an error if you can't get an access token 
        console.log('connected successfully');
    client
    .api('/me/messages')
    //.Prefer("outlook.body-content-type", "text") 
    .header("Prefer", "outlook.body-content-type=text")
    .get((err, res) => {
        if (err) {
            console.log(err)
            return;
        }
      
       res.value.forEach(function(jsonresp)
        {
           //console.log(jsonresp);
           //console.log('subject ',jsonresp.subject);
           //console.log('bodypreview ',jsonresp.bodyPreview);
           console.log('body ',jsonresp.body);
        });
        //cb(res.value[0].body);
	cb(res.value[emailcount].body);       
    });
}

app.get('/', function(req, res) {
  console.log('reached get'); 
  //console.log(req.body);
  res.sendFile('ui/index.html', { root : __dirname});
});

app.post('/', function(req, res) {
  console.log('reached post'); 
  console.log(req.body);
  res.send('Hello world post');
});

//To get the raw email
app.get('/api/rawemail', function(req, res) {
  var result = {"emailcontent": rawemail, "emailtoken": emailtoken};
  res.send(result);
});

//To get the email content when next/previous button called
app.post('/api/emailcontent', function(req, res) {
  var tokenresponse = req.body.emailtoken;
  var emailcount = req.body.emailcount;	
  getemail(tokenresponse,emailcount,function(ret){
     console.log(ret);
     res.send(ret.content);
  });
});

//To assign the model id and api key to global variable once "sign in" 
app.post('/api/modeldata', function(req, res) {
  model_id = req.body.modelid;
  api_key = req.body.apikey;
  res.send("Success");
});

//To get the model id and api key 
app.get('/api/modeldata', function(req, res) {
  var modeldata = {"model_id" : model_id, "api_key" : api_key};
  res.send(modeldata);
});

//Calling the Conversation API services
app.post('/api/emailclassify',function(req, res){

  console.log("Context Body: " +req.body.context);
  console.log("Text Body: " +req.body.text);

  conversation.message({
    workspace_id: 'aed00036-e0d1-4a47-8906-e11b16f5f9f1',
    input: {text: req.body.text},
    context: req.body.context,
    alternate_intents: true
  }, function(err, response) {
    if (err)
    {
      console.log('error:', err);
      res.send(err);
    }
    else
    {
      console.log("Complete response" +JSON.stringify(response, null, 2));
      //var intent = JSON.stringify(response,null,2);
      //intent = intent.result.intents[0].intent;
      res.send( JSON.stringify(response,null,2));
    }
  });
}); 

//to classify teh email
app.get('/classify',function(req,res){
	console.log(req.query.text);
	var text=req.query.text;
	  natural_language_classifier.classify({ text: text ,  classifier_id: '1c5f1ex204-nlc-68213'},
    function(err, tone) {
      if (err)
      {
        console.log(err);
        res.send(err);
    }
      else{
      	console.log(JSON.stringify(tone, null, 2));
        res.send(JSON.stringify(tone, null, 2));
      }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
