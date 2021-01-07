/*Importera*/
var express = require("express")
var bodyParser = require("body-parser")
var path = require("path")
var bcrypt = require('bcrypt')
var session = require('express-session')
var MongoStore = require('connect-mongo')(session)
var cors = require('cors')
var mongoose = require('mongoose')

/*Skapar instans av express*/
var app = express()

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'localhost:3000')
    res.header('Access-Control-Allow-Credentials', true)
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.append('Access-Control-Allow-Headers', 'Content-Type')
    next()
})

/*body parser middleware*/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

/*Skapa statisk sökväg*/
app.use(express.static(path.join(__dirname, 'public')))

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

/*Anslut till mongoDB med mongoose */
const url = 'mongodb+srv://miun-user:Soulfood71@cluster0.ybcm5.mongodb.net/DT162G?retryWrites=true&w=majority'
const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}
const devMode = false
let server
let database
let connection
if (devMode){
    server = '127.0.0.1:27017'
    database = 'DT162G'
    connection = mongoose.createConnection(`mongodb://${server}/${database}`)
} else {
    connection = mongoose.createConnection(url,connectionParams)
}

app.use('*', cors(corsOptions))
app.use(session({
    secret: 'work hard',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: new MongoStore({
        mongooseConnection: connection
    })
}))

function getCurrentDate() {
    let date_obj = new Date()
    //Day
    let date = ("0" + date_obj.getDate()).slice(-2)
    //Month
    let month = ("0" + (date_obj.getMonth() + 1)).slice(-2)
    //Year
    let year = date_obj.getFullYear()
    //Hours
    let hours = date_obj.getHours()
    //Minutes
    let minutes = date_obj.getMinutes()
    //Seconds
    let seconds = date_obj.getSeconds()

    //date & time in YYYY-MM-DD HH:MM:SS format
    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
}

/*Login*/
app.post("/user/login", (req, res) => {
    mongoose.connect(devMode ? `mongodb://${server}/${database}` : (url,connectionParams)  )
        .then(() => {

            connection.db.collection("users").find({ user_name: req.body.cred.userName }).toArray((err, data) => {
                if (data[0] == null) {
                    console.log("Authentication failed")
                    mongoose.connection.close()
                    return res.status(401).send(JSON.stringify({ "message": "Inloggning misslyckades" }))
                }
                var password_form_database = data[0].password
                var userId = data[0].userId
                bcrypt.compare(req.body.cred.password, password_form_database, (err, result) => {
                    if (result === true) {
                        req.session._userId = userId
                        //req.session.save()
                        mongoose.connection.close()
                        return res.status(200).send({ userId })
                    } else {
                        console.log("Authentication failed")
                        mongoose.connection.close()
                        return res.status(401).send(JSON.stringify({ "message": "Inloggning misslyckades" }))
                    }
                })
            })


        })
        .catch(err => {
            console.log(err)
            console.error('Database connection error')
            return res.status(500).send(JSON.stringify({ "message": "Database connection error" }))
        })
})

/*Update user*/
app.put("/user/update/:userId", (req, res) => {
    const userId = parseInt(req.params.userId);
    /* Connect to mongodb */
    mongoose.connect(devMode ? `mongodb://${server}/${database}` : (url,connectionParams)  )
        /* find user by username in mongo given in variable req */
        .then(() => {
            mongoose.connection.db.collection("sessions").find({}).toArray((err, data) => {
                data.forEach(e => {
                    const cookie = JSON.parse(e.session)
                    if (cookie._userId !== userId) {
                        return res.status(401).send(JSON.stringify({ "message": "Ej behörig" }))
                    } else {
                        mongoose.connection.db.collection("users").updateOne({ userId:userId}, [{$set:{ email: req.body.email }}], (err, result) => {
                            mongoose.connection.close()
                            return res.status(200).send(JSON.stringify({ "message": "Updatering lyckades" }))
                        })
                    }
                })
            })
        })
        .catch(err => {
            console.error('Database connection error')
            return res.status(500).send(JSON.stringify({ "message": "Database connection error" }))
        })
})

/*Logout*/
app.post("/user/logout/:userId", (req, res) => {
    const userId = parseInt(req.params.userId);
    if (!userId) {
        return res.status(401).send(JSON.stringify({ "message": "Inloggning misslyckades" }))
    }
    if (req.session) {
        // delete session object
        req.session.destroy((err) => {
            if (err) {
                console.log("Logout failed")
                return res.status(401).send(JSON.stringify({ "message": "Inloggning misslyckades" }))
            } else {
                mongoose.connect(devMode ? `mongodb://${server}/${database}` : (url,connectionParams)  )

                    .then(() => {
                        mongoose.connection.db.collection("sessions").find({}).toArray((err, data) => {
                            data.forEach(e => {
                                const cookie = JSON.parse(e.session)
                                if (cookie._userId === userId) {
                                    const deleteId = e._id
                                    mongoose.connection.db.collection("sessions").deleteMany({ _id: deleteId }, (err, _) => {
                                        if (err) {
                                            console.log(err)
                                        }
                                        mongoose.connection.close()
                                        return res.status(200).send(JSON.stringify({ "message": "Utloggning lyckades" }))
                                    })
                                }
                            })
                        })
                    })

                    .catch(err => {
                        console.error('Database connection error')
                        return res.status(500).send(JSON.stringify({ "message": "Database connection error" }))
                    })
            }
        })
    }

})
/*Skapar användare*/
app.post("/user/create", (req, res) => {
    mongoose.connect(devMode ? `mongodb://${server}/${database}` : (url,connectionParams)  )

        .then(() => {
            mongoose.connection.db.collection("users").find({ user_name: req.body.userName }).toArray((err, data) => {
                if (data[0] != null) {
                    mongoose.connection.close()
                    return res.status(403).send(JSON.stringify({ "message": "En användare med användarnamn " + req.body.userName + " finns redan" }))
                }
                mongoose.connection.db.collection("users").find({}, { sort: { userId: -1 } }).toArray((err, data) => {
                    var newId = 1
                    if (data && data[0] != null) {
                        newId = parseInt(data[0].userId) + 1
                    }
                    bcrypt.hash(req.body.password, 10)
                        .then((val) => {
                            let newUser = {
                                userId: newId,
                                first_name: req.body.firstName,
                                last_name: req.body.lastName,
                                user_name: req.body.userName,
                                email: req.body.email,
                                password: val
                            }
                            mongoose.connection.db.collection("users").insertOne(newUser, () => {
                                mongoose.connection.close()
                                return res.status(201).send(JSON.stringify({ "message": "Lägger till användare" }))
                            })

                        })
                        .catch(err => {
                            console.error('Hashing error')
                            return res.status(500).send(JSON.stringify({ "message": "Fel vid registrering av användare" }))
                        })
                })
            })
        })

        .catch(err => {
            console.error('Database connection error')
            return res.status(500).send(JSON.stringify({ "message": "Database connection error" }))
        })
})

/*Hämtar användare*/
app.get("/user/get", (req, res) => {
    /*Connect to mongoDB*/
    mongoose.connect(devMode ? `mongodb://${server}/${database}` : (url,connectionParams)  )

        .then(() => {
            mongoose.connection.db.collection("users").find().toArray((err, data) => {
                mongoose.connection.close()
                return res.status(200).send(data)
            })
        })
        .catch(err => {
            console.error('Database connection error')
            return res.status(500).send(JSON.stringify({ "message": "Database connection error" }))
        })
})

/*Hämtar användar id*/
app.get("/user/get/:userId", (req, res) => {
    var userId = parseInt(req.params.userId);
    mongoose.connect(devMode ? `mongodb://${server}/${database}` : (url,connectionParams)  )
        .then(() => {
            mongoose.connection.db.collection("users").find({ userId: userId }).toArray((err, data) => {
                mongoose.connection.close()
                return res.status(200).send(data)
            })
        })
        .catch(err => {
            console.error('Database connection error')
            return res.status(500).send(JSON.stringify({ "message": "Database connection error" }))
        })
})

/*Läger till bloggpost*/
app.post("/blogg/posts/add/:userId", (req, res) => {
    var userId = parseInt(req.params.userId);
    mongoose.connect(devMode ? `mongodb://${server}/${database}` : (url,connectionParams)  )
        .then(() => {
            mongoose.connection.db.collection("sessions").find({}).toArray((err, data) => {
                data.forEach(e => {
                    const cookie = JSON.parse(e.session)
                    if (cookie._userId !== userId) {
                        return res.status(401).send(JSON.stringify({ "message": "Ej behörig" }))
                    } else {
                        mongoose.connection.db.collection("users").find({ userId: userId }).toArray((err, data) => {
                            const userName = data[0].user_name;
                            mongoose.connection.db.collection("posts").find({}, { sort: { postId: -1 } }).limit(1).toArray((err, data) => {
                                let newId = 0
                                if (data && data[0] != null) {
                                    newId = parseInt(data[0].postId) + 1
                                }
                                let postDate = getCurrentDate()
                                let newPost = {
                                    postId: newId,
                                    userName: userName,
                                    userId: userId,
                                    title: req.body.title,
                                    content: req.body.content,
                                    postDate: postDate
                                }
                                mongoose.connection.db.collection("posts").insertOne(newPost, (err) => {
                                    if (err) throw err
                                    mongoose.connection.close()
                                    return res.status(201).send(JSON.stringify({ "message": "Lägger till bloggpost" }))
                                })
                            })


                        })
                    }
                })
            })
        })
        .catch(err => {
            console.error('Database connection error')
            return res.status(500).send(JSON.stringify({ "message": "Database connection error" }))
        })
})


/*Tar bort bloggpost*/
app.delete("/blogg/posts/delete/:id/:userId", (req, res) => {
    var deleteId = parseInt(req.params.id)
    var userId = parseInt(req.params.userId)
    mongoose.connect(devMode ? `mongodb://${server}/${database}` : (url,connectionParams)  )

        .then(() => {
            mongoose.connection.db.collection("sessions").find({}).toArray((err, data) => {
                data.forEach(e => {
                    const cookie = JSON.parse(e.session)
                    if (cookie._userId !== userId) {
                        return res.status(401).send(JSON.stringify({ "message": "Ej behörig" }))
                    } else {
                        mongoose.connection.db.collection("posts").deleteMany({ postId: deleteId }, (err, _) => {
                            if (err) {
                                console.log(err)
                            }
                            mongoose.connection.close()
                            return res.status(200).send(JSON.stringify({ "message": "Raderar bloggpost med id " + deleteId }))
                        })
                    }
                })
            })
        })
        .catch(err => {
            console.error('Database connection error')
            return res.status(500).send(JSON.stringify({ "message": "Database connection error" }))
        })
})

//hämtar alla blogginlägg 
app.get("/blogg/posts/get", (req, res) => {
    /*Connect to mongoDB*/
    mongoose.connect(devMode ? `mongodb://${server}/${database}` : (url,connectionParams)  )

        .then(() => {
            mongoose.connection.db.collection("posts").find().toArray((err, data) => {
                mongoose.connection.close()
                return res.status(200).send(data)
            })
        })
        .catch(err => {
            console.error('Database connection error')
            return res.status(500).send(JSON.stringify({ "message": "Database connection error" }))
        })
})

/*port för anslutning*/
var port = process.env.PORT || 9000

/*Startar servern*/
app.listen(port, () => {
    console.log("Servern är startad på port " + port)
}) 
