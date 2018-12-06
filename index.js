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
var totalemailcount = 0;

const watson = require('watson-developer-cloud');
const natural_language_classifier = watson.natural_language_classifier({
  username: 'e122adbe-5489-48b8-9c6c-222ae7a72d1d',
  password: 'ShXws2ujrNaE',
  version: 	'v1'
});
/*var conversation = watson.conversation({
  username: 'dccf3bfa-6e72-4589-a66d-1089784818cc',
  password: 'lENF1ZsL51Sp',
  version: 'v1',
  version_date: '2017-04-21'
});*/
var conversation = watson.conversation({
  username: "e625d288-b092-4055-a026-7641046596ee",
  password: "0Q5C5bhMdvnV",
  version: 'v1',
  version_date: '2017-04-21'
});

var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
  "username": "bf7a6b28-a7cb-4b07-9ca3-d0303f4ebc35",
  "password": "CiHHmEuXCRh5",
  'version_date': '2017-02-27'
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
    var jsonreq = {grant_type:"authorization_code",client_id: "c6f36595-cad5-4861-8dd7-b6849cab70bd",scope:"mail.read mail.send",code:req.query.code,client_secret:"X5gnN89guhOP6v6eyubQXwP",redirect_uri:"https://emailaccess.herokuapp.com/signin"};
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
	/*getattachment(tokenresponse,emailcount,function(ret){
            console.log(ret);
        });*/
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
    .api('/me/MailFolders/Inbox/messages')
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
	   totalemailcount = totalemailcount+1;
        });
	console.log("Email Count: " +emailcount);
        //cb(res.value[0].body);
	cb(res.value[emailcount].body);       
    });
}

/*function getattachment(tokenresponse,emailcount,cb){
    var client = MicrosoftGraph.Client.init({
        authProvider: (done) => {
        done(null, tokenresponse);
             }
            }); //first parameter takes an error if you can't get an access token 
        console.log('connected successfully');
    client
    .api('/me/MailFolders/Inbox/messages')
    //.Prefer("outlook.body-content-type", "text") 
    .header("Prefer", "outlook.body-content-type=text")
    .get((err, res) => {
        if (err) {
            console.log(err)
            return;
        }
	    
        //cb(res.value[0].body);
	console.log("message_id: "+JSON.stringify(res,0,2));
	console.log("Actual Message ID: "+res.value[emailcount].id);	    
	var message_id = res.value[emailcount].id;	   
	console.log("message_id: "+message_id);
	    
 		client
    		//.api('/me/MailFolders/Inbox/messages/AQMkADAwATNiZmYAZC0wN2Y1LTQ4MjIALTAwAi0wMAoARgAAA-a_1popu_5GpigqiMZUz5YHABNvUugGYcdMpZiCyEVCExcAAAIBDAAAABNvUugGYcdMpZiCyEVCExcAAAAk1rIOAAAA/attachments')
    		.api('/me/MailFolders/Inbox/messages/'+message_id+'/attachments')
    		//.Prefer("outlook.body-content-type", "text") 
    		//.header("Prefer", "outlook.body-content-type=text")
    		.get((err, resp) => {
        	if (err) {
            	 console.log(err)
           	 return;
        	}
      
		console.log("Attachment Response: " +JSON.stringify(resp,0,2));
		console.log(new Buffer(resp.value[emailcount].contentBytes, 'base64').toString(''));
		cb(resp);
    		});   
	    
    });
}*/

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
  var result = {"emailcontent": rawemail, "emailtoken": emailtoken, "totalemailcount": totalemailcount};
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

//To send a mail
app.post('/api/sendmail',function(req,res){
  var tokenresponse = req.body.emailtoken;
  var emailsubject = req.body.subject;
  var emailtoaddress = req.body.to_address;
  var emailbodycontent = req.body.body_content;
	
  var client = MicrosoftGraph.Client.init({
               authProvider: (done) => {
       	          done(null, tokenresponse);
               }
  }); //first parameter takes an error if you can't get an access token 
  console.log('connected successfully');
	
  // construct the email object 
  const mail = {
    subject: emailsubject,
    toRecipients: [{
        emailAddress: {
            	address: "insurancecognitive1@gmail.com"
        }
    }],
    body: {
	content: emailbodycontent,
        contentType: "html"
    }/*,
    "attachments": [
      {
        "@odata.type": "#Microsoft.OutlookServices.FileAttachment",
        "name": "menu.txt",
        "contentbytes": "bWFjIGFuZCBjaGVlc2UgdG9kYXk="
      }
    ]*/
  }
  
  const mail2 = {
    subject: emailsubject,
    toRecipients: [{
        emailAddress: {
            	address: "meenakshi.ganapathiraman@cognizant.com"
        }
    }],
    body: {
	content: emailbodycontent,
        contentType: "html"
    }
  }
  
  client
  .api('/me/sendMail')
  .post({message: mail2}, (err, response) => {	
       if (err) {
         console.log(err);
       }else{	 
	 status = response;
       }  
  })
	
  const mail3 = {
    subject: emailsubject,
    toRecipients: [{
        emailAddress: {
            	address: "Harjot.Kaur@cognizant.com"
        }
    }],
    body: {
	content: emailbodycontent,
        contentType: "html"
    }
  }
  
  client
  .api('/me/sendMail')
  .post({message: mail3}, (err, response) => {	
       if (err) {
         console.log(err);
       }else{	 
	 status = response;
       }  
  })
	
  const mail4 = {
    subject: emailsubject,
    toRecipients: [{
        emailAddress: {
            	address: "Pranav.Agrawal@cognizant.com"
        }
    }],
    body: {
	content: emailbodycontent,
        contentType: "html"
    }
  }
  
  client
  .api('/me/sendMail')
  .post({message: mail4}, (err, response) => {	
       if (err) {
         console.log(err);
       }else{	 
	 status = response;
       }  
  })
  
 
  var status = "";
  client
  .api('/me/sendMail')
  .post({message: mail}, (err, response) => {	
       if (err) {
         console.log(err);
	 //status = '"' + "failed to send mail " + err + '"' ;
	 status = err ;
       }else{	 
	 status = response;
       }  
       res.send(status); 
  })
});

//Calling the Conversation API services
app.post('/api/emailclassify',function(req, res){

  console.log("Context Body: " +req.body.context);
  console.log("Text Body: " +req.body.text);

  conversation.message({
    //workspace_id: 'aed00036-e0d1-4a47-8906-e11b16f5f9f1',
    workspace_id: '20dbd94d-a682-43f6-81e1-03c157ea4208',
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

//to classify the email
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

app.get('/signout', function(req, res) {
    console.log('Sign Out..');
    var jsonreq = {post_logout_redirect_uri:"https://emailaccess.herokuapp.com/"};
    console.log(jsonreq);
    httpreq({
    	//url: "https://emailaccess.herokuapp.com/",
    	url: "https://login.microsoftonline.com/common/oauth2/logout",
    	method: "POST",
    	headers: {
        	"content-type": "application/x-www-form-urlencoded",  // <--Very important!!!
   	 },
    	form: jsonreq
    }, function (error, response, body){
	if (error){
	   console.log('Error' ,error);
	   res.sendFile('ui/entity.html', { root : __dirname}); 
	}else{
	   console.log('Response',response);
	   console.log('Body',body);
	   res.sendFile('ui/index.html', { root : __dirname}); 
	   //res.send("You have successfully logged out the application.");
	} 
    }); 
});

/*app.post('/signout', function(req, res) {
    console.log('Sign Out..');
    res.sendFile('ui/index.html', { root : __dirname}); 
    //res.redirect('ui/index.html', { root : __dirname});
    var jsonreq = {post_logout_redirect_uri:"https://emailaccess.herokuapp.com/"};
    console.log(jsonreq);
    httpreq({
      url: "https://login.microsoftonline.com/common/oauth2/logout",
    method: "POST",
    headers: {
        "content-type": "application/x-www-form-urlencoded",  // <--Very important!!!
    },
    form: jsonreq
    }, function (error, response, body){
	if (error){
	   console.log('Error' ,error);
	   res.sendFile('ui/entity.html', { root : __dirname}); 
	}else{
	  console.log('Response',response);
	  console.log('Body',body);
	  res.sendFile('ui/index.html', { root : __dirname}); 
	} 
    }); 
});*/

//Calling the natural language undersation api services
app.post('/api/smailnlu',function(req, res){
  console.log("NLU Model Id: " +req.body.modelid);
  console.log("NLU Text: " +req.body.text);
	
  var parameters = {
        'text': req.body.text,
	'features': {
    		'entities': {
			'model': req.body.modelid
    		},
    		'keywords': {
			'model': req.body.modelid
    		},
      		'relations': {
        		'model': req.body.modelid
  		}
	}
  }

  natural_language_understanding.analyze(parameters, function(err, response) {
    if (err){
      console.log('NLU Error:', err);
      res.send("Entity Error");
    } else{
      console.log(JSON.stringify(response, null, 2));
      res.send(response);
    }
  }); 
}); 

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
