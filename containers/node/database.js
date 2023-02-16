var request = require("request");
const urlParse = require("url-parse");
const queryParse = require("query-string");
const bodyParser = require("body-parser");
const { options } = require(".");
const { testing } = require("googleapis/build/src/apis/testing");
const { response } = require("express");
const { versionhistory } = require("googleapis/build/src/apis/versionhistory");
const { resolve } = require("path");
const { Console } = require("console");

const username = 'admin'
const password ='password'
const dbaddr = "couch" //da cambiare con couch alla fine

/*
function aggiungi_vista(id_libro,testo,stars,utente){
    var options={
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/"+id_libro+'/_design/all',
        json: true,
        body:
            {
            "views": {
                "all": {
                "map": "\nfunction(doc) {\n  var dati = [doc.materia,doc.crediti,doc.appunti,doc.libro];\n  emit(doc._id,dati);\n}"
                }
            }
        }
    }
    request.put(options,function callback(error,response,body){
        console.log("dovrei aver aggiunto il file di vista");
        console.log(body);
        controllaDB(id_libro,testo,stars,utente);
    });
}
*/


//QUESTA FUNZIONE CONTROLLA SE ESISTE O MENO UN DATABASE CON NOME ID_UTENTE
async function controllaDB(id_utente){
    var options={
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/"+id_utente,
    }
    return new Promise(resolve => {
        request.get(options, async function callback(error,response,body){
            var info = JSON.parse(body);
            if(info.error =="not_found" && info.reason=="Database does not exist."){
                resolve(0);
            }
            else{
                resolve(1);
            }
    })
})
}

// VOTO, MATERIA, CREDITI, DATA ESAME
//QUESTA FUNZIONE PERMETTE DI AGGIUNGERE UN ESAME NEL DATABASE DELL UTENTE ASSOCIATO
async function aggiungi_elemento(id_utente, voto,materia, crediti, data){
    id_utente = "hex"+Buffer.from(id_utente, 'utf8').toString('hex');
    var options ={
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/"+id_utente+"/"+materia,
        json: true,
        body:{
            "materia":materia,
            "crediti": crediti,
            "voto": voto,
            "data": data
        }
        }
    return new Promise(resolve =>{ 
        request.put(options,function callback(error,response,body){
            resolve(body);
        })

    })
}
//DURANTE LA CREAZIONE DEL DATBASE BISOGNA INSERIRE UN FILE DI VISTA PER VEDERE I CONTENUTI DEL DATABASE
//QUESTO FILE VIENE INSERITO CON LA FUNZIONE SOTTOSTANTE
async function add_view(id_utente){
    id_utente = "hex"+Buffer.from(id_utente, 'utf8').toString('hex');
    var options={
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/"+id_utente+'/_design/all',
        json: true,
        body:
            {
            "views": {
                "all": {
                "map": "\nfunction(doc) {\n  var dati = [doc.materia,doc.crediti,doc.voto,doc.data];\n  emit(doc._id,dati);\n}"
                }
            }
        }
    }
    return new Promise(resolve =>{
        request.put(options,function callback(error,response,body){
            console.log(body);
            resolve(body);
        })

    })

}

//LA FUNZIONE CREA UN DATABASE DI NOME NOMEDB
async function creaDB(nomeDB){
    nomeDB = "hex"+Buffer.from(nomeDB, 'utf8').toString('hex');
    var options ={
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/"+nomeDB,
    }
    return new Promise(resolve =>{
        request.put(options, function callback(error,response,body){
            resolve(body);
        })

    })

}

//TRAMITE QUESTA FUNZIONE E' POSSIBILE OTTENERE IL REV DI UNO SPECIFICO ESAME, IL REV è NECESSARIO PER LA RIMOZIONE 
// INFATTI QUESTA FUNZIONE SERVE PER LA FUNZIONE SUCCESSIVA
async function getRevbyId(id_utente, materia){
    var options ={
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/"+id_utente+"/"+materia,
    }
    return new Promise(resolve =>{
        request.get(options,function callback(error, response, body){
            resolve(JSON.parse(body)._rev);
        })
    })
}

//QUESTA FUNZIONE ELIMINA UN ELEMENTO NEL DATABASE
async function rimuovi_elemento(id_utente,materia){
    id_utente = "hex"+Buffer.from(id_utente, 'utf8').toString('hex');
    var rev_to_remove = await(getRevbyId(id_utente,materia))
    var options = {
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/"+id_utente+"/"+materia+"?rev="+rev_to_remove
    }
    return new Promise(resolve =>{
        request.delete(options,function callback(error,response,body){
            resolve(JSON.parse(body))
        })
    })

}

//QUESTA FUNZIONE PERMETTE DI AGGIUNGERE UN ESAME AL DATABASE
async function aggiungi_esame(id_utente,voto,materia,crediti,data){
    var result = await controllaDB(id_utente);
    if(result){
        //NEL CASO SI VOLESSE AGGIUNGERE UN ESAME GIA' DATO, QUESTO PUò ESSERE SOVRASCRITTO
        console.log(await rimuovi_elemento(id_utente,materia))
        var inserimento = await aggiungi_elemento(id_utente,voto,materia,crediti,data)
        console.log(await getRevbyId(id_utente,materia))
        //console.log(inserimento
    }
    else{
        var creazione = await creaDB(id_utente);
        console.log(creazione);
        var risultato_vista = await add_view(id_utente)
        console.log(risultato_vista)
        var inserimento = await aggiungi_elemento(id_utente,voto,materia,crediti,data)
    }
}

//QUESTA FUNZIONE PERMETTE DI OTTENERE GLI ESAMI SOSTENUTI DA UNO STUDENTE
async function get_exams_by_user(id_utente){
    id_utente = "hex"+Buffer.from(id_utente, 'utf8').toString('hex');
    var options = {
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/"+id_utente+'/_design/all/_view/all'
        
    }
    return new Promise(resolve=>{
        
        request.get(options,function callback(error, response, body){
            console.log(body);
            resolve(JSON.parse(body))
        })
    })
}

// CON QUESTA FUNZIONE VIENE GENERATO IL DATABASE DEGLI APPUNTI 
async function generateDBnotes(){
    var options 
    var options ={
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/notes",
    }
    var result = new Promise(resolve =>{
        request.put(options,function callback(error,response,body){
            resolve(body);
        })
           
    })

    var options={
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/notes/_design/all",
        json: true,
        body:
            {
            "views": {
                "all": {
                "map": "\nfunction(doc) {\n  var dati = [doc.path,doc.nome,doc.materia,doc.autore];\n  emit(doc._id,dati);\n}"
                }
            }
        }
    }
    result.then((value)=>{
        request.put(options, function callback(error,response, body){
            console.log(body)
        })
    })
    
}
//QUESTA FUNZIONE PERMETTE DI OTTENERE L'ELENCO DI TUTTI GLI APPUNTI
async function getAllnotes(){
    var options = {
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/notes/_design/all/_view/all"
    }
    return new Promise(resolve=>{
        request.get(options,function callback(error,response,body){
            resolve(body)
        })
    })
}
//QUESTA FUNZIONE PERMETTE DI AGGIUNGERE UN NUOVO APPUNTO NEL DATABASE
async function addNote(path,nome,materia,autore){
    var options ={
        url:'http://'+username+":"+password+"@"+dbaddr+":5984/notes/"+path,
        json: true,
        body:{
            "path":path,
            "nome": nome,
            "materia": materia,
            "autore": autore
        }
    }
    return new Promise(resolve=>{
        request.put(options,function callback(error,response,body){
            resolve(body);
        })
    })
}


// QUESTA FUNZIONE CERCA GLI APPUNTI CHE SIANO DI UNA DETERMINATA MATERIA
async function getNotesbyMateria(materia){
    var allNotes = JSON.parse(await getAllnotes());

    var elements = allNotes.total_rows;

    var selected = []

    for(var i=0;i<elements;i++){
        if(allNotes.rows[i].value[2].toLowerCase()==materia.toLowerCase()){
            selected.push(allNotes.rows[i])
        }
    }
    console.log(selected)
    return selected


}



module.exports = {creaDB,aggiungi_esame,get_exams_by_user,generateDBnotes,addNote,getAllnotes,getNotesbyMateria,rimuovi_elemento};