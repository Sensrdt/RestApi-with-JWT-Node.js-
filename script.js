/*
  post - /user/login => return jwt token on response
  post - /user/signup => return user id ( unique ) on response
*/

const express = require('express');
const jwt  = require('jsonwebtoken');
const bodyParser = require('body-parser');
const ids = require('short-id');
const app = express();
const port = 2080;

let global_var;
app.use(bodyParser.json());

// Mock database
const db = {
  users : [
    {
      id : "id-" + ids.generate(),
      name : "maria",
      username : "maria",
      password : "pass_maria",
      dob : "05/08/2001",
    },
    {
      id : "id-" + ids.generate(),
      name : "John Doe",
      username : "JD",
      password : "JD",
      dob : "21/11/1992",
    },
    {
      id : "id-" + ids.generate(),
      name : "Abc",
      username : "@bc",
      password : "cba",
      dob : "01/12/1998",
    }
  ]
}

app.get('/',(req, res) =>{
  res.send("Listening from get ");
})

// further approach for checking the token and redirecting it to new routes where user can see there details
app.post('/user/extra', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    res.json(db.users[global_var]);
  });
});

// Login
app.post('/user/login',(req, res) =>{
    let flag = true;
    // O(n) Time complexity in worst case
    // n denotes the database length or the size of the database
if (req.body.username != null && req.body.password !=  null)
{
      for (let i=0; i<db.users.length; i++){
        if (req.body.username === db.users[i].username && req.body.password === db.users[i].password){
          //console.log(i);
          global_var = i;
          //console.log("Global var " + global_var);
          flag = true;
          break;
        }else flag = false;
      }

      if (!flag) res.status(400).json("Entry forbidden");
      else {
        jwt.sign({db}, 'secretKey', (err, token) => {
          res.json({
            token
          })
        });
      }
}else {
  res.status(500).json("Enter all credentials");
}

})

// Signup
app.post('/user/signup', (req, res) =>{
  const { username, name, dob, email, password } = req.body;
  db.users.push({
    username : username,
    password : password,
    dob : dob,
    name : name,
    id : "id-" + ids.generate()
  })
if (req.body.username != null && req.body.name != null && req.body.password != null && req.body.dob != null) res.json(db.users[db.users.length-1].id);
else res.status(400).send("Enter all credentials");
})

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
  }

}
app.listen(port, ()=> {
  console.log(`Node.js is listening to ${port} port`);
})


ids.configure({
    length: 10,
    algorithm: 'sha1',
    salt: Math.random
});
