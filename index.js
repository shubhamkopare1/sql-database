const express = require("express");
let path = require("path");
var methodOverride = require("method-override");
const app = express();
const port = 8080;
let mysql = require("mysql2");
const { error } = require("console");
const { errorMonitor } = require("events");
const { use } = require("react");
let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shubhu@123",
  database: "collage",
});

connection.connect();
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.listen(port, () => {
  console.log("server started");
});
app.get("/", (req, res) => {
  let q = "SELECT count(*) FROM users";
  try {
    connection.query(q, function (error, results, fields) {
      if (error) throw error;
      let users = results[0]["count(*)"];
      res.render("index.ejs", { users });
    });
  } catch (error) {
    console.log(error);
  }
});
app.get("/users/:id/edit", (req, res) => {
  let { id } = req.params;

  let q = `SELECT * FROM users WHERE id = "${id}"`;

  connection.query(q, (error, result) => {
    if (error) {
      console.log(error);
      res.send("Error retrieving user data");
    } else {
      let data = result[0];
      res.render("edit.ejs", { data });
    }
  });
});

app.patch("/users/:id", (req, res) => {
  let { id } = req.params;
  let { username: newusername, password: newpassword } = req.body;

  let q = `SELECT * FROM users WHERE id = "${id}"`;

  connection.query(q, (error, result) => {
    console.log(result[0]);

    if (error) {
      console.log(error);
      res.send("Error retrieving user data");
    } else {
      let data = result[0];
      if (newpassword != data.password) {
        res.send("you have enter wrong password");
      } else {
        let q = `UPDATE users SET username = "${newusername}" WHERE id = "${id}" AND password = "${newpassword}"`;

        connection.query(q, (error, result) => {
          if (error) {
            console.log(error);
            res.send("Error updating username");
          } else {
            res.redirect("/users");
            console.log(result);
          }
        });
      }
    }
  });
});
app.get("/users", (req, res) => {
  let q = "SELECT * FROM users";
  connection.query(q, (error, results) => {
   
    res.render("users.ejs", { results });
  });
});
app.delete("/users/:id", (req, res) => {
    let { id } = req.params;
    let { email: newemail, password: newpassword } = req.body;
    
    let q = `SELECT * FROM users WHERE id = "${id}"`;
    connection.query(q, (error, result) => {
      if (error) {
        console.log(error);
        return res.send("Error retrieving user data");
      }
      
      let data = result[0];
      
      if (data.email !== newemail || data.password !== newpassword) {
        console.log("Invalid email or password");
        return res.send("Invalid email or password");
      } 
      
      let deleteQuery = `DELETE FROM users WHERE id = "${id}"`;
      connection.query(deleteQuery, (error) => {
        if (error) {
          console.log(error);
          return res.send("Error deleting user");
        }
        
        res.redirect("/users");
      });
    });
  });
  
app.get("/users/:id/delete",(req,res)=>{
    let {id}= req.params;
    let q = `SELECT * FROM users WHERE id = "${id}"`
    connection.query(q,(error,result)=>{
        let data= result[0]
        if (error) {
            res.send("error")
        }else{
            res.render("delete.ejs",{data})
        }
    })
})
app.post("/users/post",(req,res)=>{

    let {id,username,email,password}=req.body;
   
    if (id.trim() == ""  ||  username.trim() =="" ||email.trim()  == "" || password.trim()  == "" ) {
       res.send('fill the input fields ')
       return;
    }
  let q = `INSERT INTO users VALUES (?,?,?,?)`
  let value = [id, username, email, password];
  connection.query(q,value,(error,result)=>{
    if (error) {
        res.send(error)
    }else{
           res.redirect("/users")
    }
    
     
    
       
  })

})

app.get("/users/post",(req,res)=>{
    
    res.render("post.ejs")
})