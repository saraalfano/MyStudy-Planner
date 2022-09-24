const express = require('express');
const app = express();
const port = 3000;

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


