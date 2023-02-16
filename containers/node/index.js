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
const usernamerabbit = 'user';
const passwordrabbit = 'password';
var amqp = require('amqplib/callback_api');
var request = require("request");
var upload = require('express-fileupload');
var bodyParser = require('body-parser');
const fs = require("fs")
var oauth2Client

const cookieParser = require('cookie-parser');
const { send } = require('process');
app.use(cookieParser());

const db = require('./database');
const { triggerAsyncId } = require('async_hooks');



app.use(bodyParser.urlencoded())
app.use(bodyParser.urlencoded({
  extended: true
}));

db.generateDBnotes()


app.use(upload())





function sendMessage(email){
  amqp.connect('amqp://'+usernamerabbit+':'+passwordrabbit+'@rabbit', function(error0, connection) {
      if (error0) {
          throw error0;
      }
      connection.createChannel(function(error1, channel) {
      if (error1) {
      throw error1;
      }
      var queue = 'mail';
      var msg = email;
  
      channel.assertQueue(queue, {
      durable: true
      });
  
      channel.sendToQueue(queue, Buffer.from(msg));
      console.log(" [x] Sent %s", msg);
      });
      setTimeout(function() {
          connection.close();
      }, 500);
      });
  }

// SEZIONE API

/**
 * @api {get} /api/addExam/:user_id/:materia/:crediti/:voto/:data Add an exam in the database
 * @apiName addExam
 * @apiGroup User
 *
 * @apiParam {String} user_id email of the user who wants to add an exam on his profile
 * @apiParam {String} materia course name 
 * @apiParam {int} crediti number of cfu of the exam
 * @apiParam {int} voto mark obtained in the exam
 * @apiParam {date} data date when the exam is passed
 * 
 * @apiSuccess {JSON } body A json object whit the result of the operation
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": "ok",
 *     }
 */



// API PER AGGIUNGERE UN ESAME NEL DATABASE
app.get('/api/addExam/:user_id/:materia/:crediti/:voto/:data', async (req,res)=>{
  try{
    var parameters = req.params
    db.aggiungi_esame(parameters.user_id,parameters.voto,parameters.materia,parameters.crediti,parameters.data)
  }catch(error){
    res.send({error: error})
  }
  res.send({result:"ok"})
})

app.get('/logout', (req,res)=>{
  res.clearCookie("name");
  res.clearCookie("email");
  res.clearCookie("access");
  res.clearCookie("AuthSession");
  res.clearCookie("access_token");
  return res.redirect("https://mail.google.com/mail/u/0/?logout&hl=en")
})

/**
 * @api {get} /api/getExams/:user_id Get Exam by userId
 * @apiName Get Exams by id
 * @apiGroup User
 *
 * @apiParam {String} user_id email of the user who wants to add an exam on his profile
 * 
 * @apiSuccess {JSON } body A json object whit the result of the operation
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       
 *     }
 */


//API PER VEDERE GLI ESAMI DI UN UTENTE
app.get('/api/getExams/:user_id',async (req,res)=>{
  var user_id= req.params.user_id
  exams = await db.get_exams_by_user(user_id)
  console.log(exams)
  res.send(exams) 
})

/**
 * @api {get} /api/addNote/:path/:nome/:materia/:autore Add A Note in the database
 * @apiName Add Note
 * @apiGroup Notes
 *
 * @apiParam {String} path Is the path of the document in the server filesystem
 * @apiParam {String} nome is the name of the document
 * @apiParam {String} materia is the subject of the note
 * @apiParam {String} autore is the author of the note
 * 
 * @apiSuccess {JSON } body A json object whit the result of the operation
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       response: "ok"
 *     }
 */


//API PER AGGIUNGERE APPUNTI AL DATABASE DEGLI APPUNTI
app.get("/api/addNote/:path/:nome/:materia/:autore",async (req,res)=>{
  var parameters = req.params
  db.addNote(parameters.path,parameters.nome,parameters.materia,parameters.autore)
  res.send({response: "ok"})
})

/**
 * @api {get} /api/allNotes Returns all notes saved in the server
 * @apiName Get All Notes
 * @apiGroup Notes
 *
 * 
 * @apiSuccess {JSON } body A json object whit the result of the operation
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        note0: {...}
 *        note1: {...}
 *        ...
 *        noteN: {...}
 *     }
 */


//API PER OTTENERE L'ELENCO DI TUTTI GLI APPUNTI
app.get("/api/allNotes",async (req,res)=>{
  var allNotes = await db.getAllnotes()
  res.send(JSON.parse(allNotes))
})

/**
 * @api {get} /api/NoteBySubject/:materia Returns all notes of a given subject saved in the server
 * @apiName Get notes by subject 
 * @apiGroup Notes
 *
 * @apiParam {String} materia is the subject of the note
 * 
 * @apiSuccess {JSON } body A json object whit the result of the operation
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        note0: {...}
 *        note1: {...}
 *        ...
 *        noteN: {...}
 *     }
 */

//API PER OTTENERE L'ELENCO DEGLI APPUNTI DI UNA DETERMINATA MATERIA
app.get("/api/NoteBySubject/:materia",async (req,res)=>{
  var notes = await db.getNotesbyMateria(req.params.materia)
  res.send(notes)
})


/**
 * @api {get} /api/GetNoteById/:noteID returns the information about a note by its ID
 * @apiName Get note by Id
 * @apiGroup Notes
 *
 * @apiParam {String} noteId is a identifier for the notes
 * 
 * @apiSuccess {Document} document A pdf document containing the requested file
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        note0: {...}
 *        note1: {...}
 *        ...
 *        noteN: {...}
 *     }
 */

app.get("/api/GetNoteById/:noteID",async (req,res)=>{
  var path_nota = req.params.noteID
  res.download("./uploads/"+path_nota)

})



// ------- FINE SEZIONE API --------





app.get('/upload',(req,res)=>{
  res.render('upload')
})



app.post('/upload',(req,res) =>{
  if(req.files){
    var materia = req.body.materia
    var argomento = req.body.argomento
    console.log(req.files)
    var fileStream = req.files.file.data
    var  file = req.files.file
    var filename = file.name
    var autore = req.cookies.name

    var nome_path = file.md5 + '.pdf'
    console.log(nome_path)
    console.log(argomento)
    console.log(autore)
    console.log(materia)

    const filepath = path.join(__dirname,'uploads/'+nome_path)
    console.log(filepath)
    
    db.addNote(nome_path,argomento,materia,autore)

    file.mv('./uploads/'+nome_path, async function(err){
      if(err){
        res.send(err)
      }
      else{
        res.send("File Uploaded")

        var oauth2Client = new google.auth.OAuth2(
          clientID,
          clientSecret,
          "https://localhost/done" //DA CAMBIARE
        );

        var REFRESH_TOKEN = req.cookies.refresh
        var ACCESS_TOKEN = req.cookies.access_token

        oauth2Client.setCredentials({access_token: ACCESS_TOKEN})


        const drive = google.drive({
          version: 'v3',
          auth: oauth2Client

        })
        var found_folder = false;
        var folder_id = null;
        const files = [];
        const result = await drive.files.list({
          q: 'mimeType=\'application/vnd.google-apps.folder\'',
          fields: 'nextPageToken, files(id, name)',
          spaces: 'drive',
        });
        Array.prototype.push.apply(files, result.files);
        result.data.files.forEach(function(file) {
          console.log('Found file:', file.name, file.id);
          if(file.name =="MyStudyPlannerNotes"){
            found_folder = true;
            folder_id = file.id;

          }
        });
    

        fileStream = fs.createReadStream(filepath)
        const service = drive;
        if(found_folder==false){
          const fileMetadata = {
            name: 'MyStudyPlannerNotes',
            mimeType: 'application/vnd.google-apps.folder',
          };
          try{
            const file = await service.files.create({
              resource: fileMetadata,
              fields: 'id',
            });
            found_folder = true;
            folder_id = file.data.id
            console.log('Folder Id:', file.data.id);
          }catch(error){
          }
        }

        console.log(found_folder)
        console.log(folder_id)


        try{
          const response = await drive.files.create({
            requestBody: {
              name: argomento+'.pdf',
              mimeType: 'application/pdf',
              parents: [folder_id]
            },
            media: {
              mimeType: 'application/pdf',
              body: fileStream
              
            }
          }
          )
          console.log(response.data)
        }catch(error){
          console.log(error)
        }
        

      }
    })
  }

})

app.get('/add_exam',async (req,res)=>{
  res.render('add_exam')
})

app.post('/add_exam',function (req,res){
  var esame = req.body.esame
  var crediti = req.body.crediti
  var data = req.body.data
  var voto = req.body.voto
  if(voto==''){
    voto = 0
  }
  if(crediti =='' || crediti <0 || crediti > 24){
    res.send("errore nell inseriemento dei crediti")
    return
  }
  
  console.log(data)
  email = req.cookies.email
  db.aggiungi_esame(email,voto,esame,crediti,data).then((value)=>{
    res.redirect('/home');
  })

})

app.post("/remove_exam", (req,res)=>{
  var esame = req.body.esame
  console.log(esame)
  db.rimuovi_elemento(req.cookies.email,esame).then((value)=>{
    return res.redirect("/home")
  })
  

})

app.get('/home', (req,res)=>{
  var email = req.cookies.email;
  var name = req.cookies.name;
  var file = db.get_exams_by_user(email).then((value)=>{
    res.render('home',{file:JSON.stringify(value) , name:name, email:email});
  });
})



app.get('/done',async (req,res)=>{

  const queryURL = new urlParse(req.url);
  const code = queryParse.parse(queryURL.query).code;

  const oauth2Client = new google.auth.OAuth2(
    clientID,
    clientSecret,
    "https://localhost/done"
  )
  
  const tokens = await oauth2Client.getToken(code);
  console.log(tokens);
  console.log("#############################################")
  
  access_token = JSON.stringify(tokens.tokens.access_token);
  refresh_token = tokens.tokens.refresh_token;

  oauth2Client.setCredentials({refresh_token: refresh_token})

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
    res.cookie("name",name);

    sendMessage(email); 
    
    return res.redirect('/home');

    var file = db.get_exams_by_user(email).then((value)=>{
      res.render('home',{file:JSON.stringify(value) , name:name, email:email});
    });
    
    

  });

})


app.get('/', (req, res) => {
  res.render('index');
});



if(!module.parent){
  app.listen(port, () =>
    console.log(`Example app listening on port ${port}!`),
  );
}



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
  oauth2Client = new google.auth.OAuth2(
    clientID,
    clientSecret,
    "https://localhost/done" //DA CAMBIARE
  );
  
  // Access scopes for read-only Drive activity.
  const scopes = [
    //'https://www.googleapis.com/auth/youtube', //DA CAMBIARE 
    'profile',  
    'email',
    'https://www.googleapis.com/auth/drive'  // da decommentare
  ];
  
  // Generate a url that asks permissions for the Drive activity scope
  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    /** Pass in the scopes array defined above.
      * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes
    // Enable incremental authorization. Recommended as a best practice.
    //include_granted_scopes: true
  });
  res.redirect(authorizationUrl);
});



app.post("/load_on_drive", async (req,res)=>{
  var path_param = req.body.path
  var argomento = req.body.argomento

  var oauth2Client = new google.auth.OAuth2(
    clientID,
    clientSecret,
    "https://localhost/done" //DA CAMBIARE
  );

  var REFRESH_TOKEN = req.cookies.refresh
  var ACCESS_TOKEN = req.cookies.access_token

  oauth2Client.setCredentials({access_token: ACCESS_TOKEN})


  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client

  })
  var found_folder = false;
  var folder_id = null;
  const files = [];
  const result = await drive.files.list({
    q: 'mimeType=\'application/vnd.google-apps.folder\'',
    fields: 'nextPageToken, files(id, name)',
    spaces: 'drive',
  });

  Array.prototype.push.apply(files, result.files);
  result.data.files.forEach(function(file) {
    console.log('Found file:', file.name, file.id);
    if(file.name =="MyStudyPlannerNotes"){
      found_folder = true;
      folder_id = file.id;

    }
  });

  if(found_folder==false){
    const fileMetadata = {
      name: 'MyStudyPlannerNotes',
      mimeType: 'application/vnd.google-apps.folder',
    };
    try{
      const file = await drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });
      found_folder = true;
      folder_id = file.data.id
    }catch(error){
      console.log(error)
    }
  }
  
  const filepath = path.join(__dirname,'uploads/'+path_param)
  

  var fileStream = fs.createReadStream(filepath)
  try{
    const response = await drive.files.create({
      requestBody: {
        name: argomento+'.pdf',
        mimeType: 'application/pdf',
        parents: [folder_id]
      },
      media: {
        mimeType: 'application/pdf',
        body: fileStream
        
      }
    }
    )
    console.log(response.data)
  }catch(error){
    console.log(error)
  }

  res.send("ok")
  
})


app.get('/notes', async (req, res) => {
  var allNotes = await db.getAllnotes()
  res.render('notes',{file:allNotes})
});


module.exports = app