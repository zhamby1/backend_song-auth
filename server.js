const express = require("express");
const bodyParser = require('body-parser');
const Song = require("./models/song");
var cors = require('cors');
const jwt = require("jwt-simple");
const User = require("./models/user")
var morgan = require('morgan')

const app = express();
app.use(cors());
app.use(morgan('combined'))

app.use(bodyParser.json());
const router = express.Router();

const secret = "supersecret"

//create a new username and password
router.post("/user", function(req, res) {

    if (!req.body.username || !req.body.password) {
       res.status(400).json({ error: "Missing username and/or password"});
       return;
    }
 
    const newUser = new User({
       username: req.body.username,
       password: req.body.password,
       status:   req.body.status
    });
 
    newUser.save(function(err) {
       if (err) {
          res.status(400).send(err);
       }
       else {
          res.sendStatus(201);  // Created
       }
    });
 });


//authentication
router.post("/auth", function(req,res){
    if (!req.body.username || !req.body.password) {
        res.status(400).json({ error: "Missing username and/or password"});
        return;
     }
     //test

    User.findOne({username: req.body.username}, function(err,user){
        //connection or server err
        if(err){
            res.status(400).send(err)
        }
        //checks to see if user is in database
        else if(!user){
            res.status(401).json({error:"Bad Username"})
        }
        //checks to see is the users password is correct
        else{
            if(user.password != req.body.password){
                res.status(401).json({error:"Bad Password"})
            }
            //succesful login
            else{
                //create a token that is encoded with jwt that sends back the username encoded
                username2 = user.username
                const token = jwt.encode({username: user.username},secret)
                const auth = 1

                //respond with a token with the value of the token constant above
                res.json({
                    username2,
                    token:token,
                    auth:auth
                })

            }
        }
    })


})

//get status of users with a valid token currently, and see if it matches the clients token trying to access the application
router.get("/status", function(req,res){
    //see if the X-auth header is set
    if(!req.headers["x-auth"]){
        return res.status(401).json({error: "Missing X-Auth header"})
    }

    //if x-auth contains the token (it should)
    const token = req.headers["x-auth"]
    try{
        const decoded = jwt.decode(token,secret)
    

    //send back all username and status fields that have tokens
    User.find({},"username status", function(err,users){
        res.json(users)
    })
}
    catch(ex){
        res.status(401).json({error: "invalid jwt"})
    }

})



//Grab all songs in the database
router.get("/songs", function(req,res){

    let query = {};
    if(req.query.genre){
        query = {genre: req.query.genre};
    }


    Song.find(query,function(err,songs){
        if (err){
            res.status(400).send(err);
        }
        else{
            res.json(songs);
        }

    });


});

//add a song to the database
router.post("/songs", function(req,res){
    const song = new Song(req.body);
    song.save(function(err,song){
        if(err){
            res.status(400).send(err);
        }
        else{
            res.status(201).json(song)
        }
    })
})

router.get("/songs/:id", function(req, res) {
    // Use the ID in the URL path to find the song
    Song.findById(req.params.id, function(err, song) {
       if (err) {
          res.status(400).send(err);
       } 
       else {
          res.json(song);
       }
    });
 });

 router.put("/:id", function(req, res) {
    // Song to update sent in body of request
    const song = req.body;
 
    // Replace existing song fields with updated song
    Song.updateOne({ _id: req.params.id }, song, function(err, result) {
       if (err) {
          res.status(400).send(err);
       } 
       else if (result.n === 0) {
           res.sendStatus(404);
       } 
       else {
           res.sendStatus(204);
       }
    });
 });

 router.delete("/songs/:id", function(req, res) {
    Song.deleteOne({ _id: req.params.id }, function(err, result) {
       if (err) {
          res.status(400).send(err);
       } 
       else if (result.n === 0) {
          res.sendStatus(404);
       } 
       else {
          res.sendStatus(204);
       }
    });
 });

app.use("/api", router);
app.listen(3000);