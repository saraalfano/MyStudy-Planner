const express = require('express');
const app = express();
const port = 3000;
const {google} = require("googleapis");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { OAuth2 } = google.auth;
const urlParse = require('url-parse');
const queryParse = require('query-string');
var path = require('path');
app.set('view engine', 'pug'); 
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(port, () => {
  console.log("Hello");
});

const cookieParser = require('cookie-parser');
app.use(cookieParser());


const clientID = "1076187362997-hqfpckq3am5qq60a4ub4mst46gti7n3m.apps.googleusercontent.com"; //DA CAMBIARE
const clientSecret = "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";   //DA CAMBIARE
var apiKey = "AIzaSyBddaPSEsw9JR4b_U_H3-DYDwJ8tA2ChyQ";       //DA CAMBIARE


app.get("/login", (req,res) =>{
  const {google} = require('googleapis');
  /**
   * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
   * from the client_secret.json file. To get these credentials for your application, visit
   * https://console.cloud.google.com/apis/credentials.
   */
  const oauth2Client = new google.auth.OAuth2(
    clientID,
    clientSecret,
    "https://localhost:3000/done" //DA CAMBIARE
  );
  
  // Access scopes for read-only Drive activity.
  const scopes = [
    //'https://www.googleapis.com/auth/youtube', //DA CAMBIARE 
    'profile',  
    'email'
  ];
  
  // Generate a url that asks permissions for the Drive activity scope
  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    /** Pass in the scopes array defined above.
      * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true
  });
  res.redirect(authorizationUrl);
});

app.get('/done',async (req,res)=>{

  const queryURL = new urlParse(req.url);
  const code = queryParse.parse(queryURL.query).code;

  const oauth2Client = new google.auth.OAuth2(
    clientID,
    clientSecret,
    "https://localhost:3000/done"
  )
  
  const tokens = await oauth2Client.getToken(code);
  console.log(tokens);
  access_token = JSON.stringify(tokens.tokens.access_token);
  refresh_token = tokens.tokens.refresh_token;

  res.cookie("refresh",refresh_token);
  res.cookie("access_token",access_token);
  res.cookie("access","true");

  var options = {
    url : "https://www.googleapis.com/oauth2/v2/userinfo", 
    headers : {
      Authorization : "Bearer " + access_token,
    }
  }
  request.get(options,function callback(error,response,body){
    var info = JSON.parse(body);
    var name = info.name;
    var email = info.email;
    res.cookie("email",email);
    addUser(name,email);
    res.render('homepage',{name:name, email:email});

  });
})

