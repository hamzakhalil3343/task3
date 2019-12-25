const http = require('http');
var mongoose=require('mongoose');
const server = http.createServer();
const bodyParser = require('body-parser');
const express = require('express');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const app = express();
// ************** models ******************

const Student = mongoose.model('Student', {
  name: String,
  student_id: Number,
  email: String,
  password: String,
  date_added: Date
 });

 const Users = mongoose.model('Users', {
  name: String,
  email: String,
  password: String,
  date_added: Date
 });




mongoose.connect('mongodb://localhost:27017/myfirstmongodb', {useNewUrlParser: true,useUnifiedTopology:true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));





app.post('/signup', async (req, res) => {

  try{
    const body = req.body;

    // there must be a password in body

    // we follow these 2 steps

    const password = body.password;

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    body.password = hash;
    console.log('hash - > ', hash);
    const user = new Users(body);


    const result = await user.save();

    res.send({
      message: 'Student signup successful'
    });

  }

  catch(ex){
    console.log('ex',ex)

    res.send({
      message: 'Error',
      detail: ex
    }).status(500);
  }

  });


  app.get('/students', async (req, res) => {

    const allStudents = await Student.find();
    console.log('allStudents', allStudents);
  
    res.send(allStudents);
  });



  app.post('/login', async (req, res) => {
    try {
      const body = req.body;
  
      const email = body.email;
  
      // lets check if email exists
  
      const result = await Users.findOne({ email: email });
      if (!result) {
        // this means result is null
        res.status(401).send({
          Error: 'This user doesnot exists. Please signup first'
        });
      } else {
        // email did exist
        // so lets match password
  
        if ( bcrypt.compareSync(body.password, result.password)) {
          // great, allow this user access
  
          console.log('match');

          const token = jsonwebtoken.sign({
             data: body,
             role: 'User'
          }, 'supersecretToken', { expiresIn: '7d' });
  
          console.log('token -> ', token)
  
          res.send({ message: 'Successfully Logged in', token: token });
  
          
        } else {
          console.log('password doesnot match');
  
          res.status(401).send({ message: 'Wrong email or Password' });
        }
      }
    } catch (ex) {
      console.log('ex', ex);
    }
  });













  app.get('/', (req, res) => { 
    res.send('hello world');
  });



// server.on('request',(request,response)=>{
//    response.writeHead(200,{'Content-Type':'text/plain'});
//    response.write('Hello world');
//    response.end();
// });

// server.listen(3000,()=>{
//   console.log('Node server created at port 3000');
// });
app.listen(3000, () => {
  console.log('Express application running on localhost:3000');
});