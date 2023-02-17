# MyStudy-Planner
MyStudy Planner è un'applicazione grazie alla quale puoi gestire lo studio inserendo ognuno dei tuoi esami e caricando i tuoi appunti di ogni materia.

## Schema del progetto
![image](https://user-images.githubusercontent.com/102963704/219648347-2b193781-581a-4258-844d-f9256c80d884.png)

## Soddisfacimento dei requisiti:
- L'applicazione utilizza Docker per la containerizzazione e Docker Compose per l'orchestrazione.
- Google Oauth può essere utilizzato per effettuare l'accesso e per utilizzare il Drive.
- L'applicazione si interfaccia con Google Drive, servizio REST commerciale, attraverso la sua API.
- Il progetto fornisce 6 API REST effettuare varie operazioni sugli appunti e sugli esami.
- Il progetto fornisce un altro servizio REST che è CouchDB.
- L'applicazione utilizza RabbitMQ per far comunicare in maniera asincrona il server principale con un'istanza Nodejs che utlizza Nodemailer per iniviare un'email di conferma della registrazione agli utenti.
- E' implementata una procedura di CI/CD attraverso Github Actions, che prevede l'esecuzione di test al momento di una push o pull,
  implementati grazie a Mochajs e Chaijs
