const functions = require('firebase-functions');
const admin = require('firebase-admin')
const app = require('express')()
const firebase = require('firebase')
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
var firebaseConfig = {
    apiKey: "AIzaSyB1PDceHct0rgHrJ1BEizzQUiwXmQPu5zQ",
    authDomain: "fcc-12hr-fb-clone.firebaseapp.com",
    databaseURL: "https://fcc-12hr-fb-clone.firebaseio.com",
    projectId: "fcc-12hr-fb-clone",
    storageBucket: "fcc-12hr-fb-clone.appspot.com",
    messagingSenderId: "1026327730125",
    appId: "1:1026327730125:web:0e010766222c570d615684"
  };
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
admin.initializeApp()

const db = admin.firestore()

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

app.get('/screams', (req, res) => {
    db
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = []
            data.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                })
            })
            return res.json(screams)
        })
        .catch(err => console.error(err))
        
})
exports.getScreams = functions.https.onRequest((req, res) => {
    db
        .collection('screams')
        .get()
        .then(data => {
            let screams = []
            data.forEach(doc => {
                screams.push(doc.data())
            })
            return res.json(screams)
        })
        .catch(err => console.error(err))
        
})

const FBAuth = (req, res, next) => {
    let idToken
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        idToken = req.headers.authorization.split('Bearer ')[1]
    } else {
        console.error('no token found');
        return res.status(403).json({ error: 'Unauthorized'})
    }
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken
            console.log(decodedToken);
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get()
        })
        .then(data => {
            // console.log('data', data);
            req.user.handle = data.docs[0].data().handle
            return next()
        })
        .catch(err => {
            res.status(403).json({error: 'token issue'})
            console.error(err)
        })
}
// exports.createScreams = functions.https.onRequest((req, res) => {
app.post('/scream', FBAuth, (req, res) => {
    //     if(req.method !== 'POST'){
    //     res.status(400).json({error: 'method not allowed'})   
    // }
    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString()
    }
    
    db
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully`})
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'})
            console.error(err)
        })
        
})

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
  };
  
  const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
  };

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }

    let errors = {}
    if(isEmpty(newUser.email)){
        errors.email = 'Email must not be empty'
    } else if (!isEmail(newUser.email)){
        errors.email = 'Must be a valid email'
    }
    if(isEmpty(newUser.password)) errors.password = 'Must not be empty'
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match'
    if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty'

    if(Object.keys(errors).length > 0) return res.status(400).json(errors)

    let token, userId
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                res.status(400).json({ handle: 'this handle is already taken'})
            } else {
                return firebase
                .auth()
                .createUserWithEmailAndPassword(newUser.email, newUser.password)
        
            }
        })
        .then(data => {
            userId = data.user.uid
            return data.user.getIdToken()
        })
        .then(tokenId => {
            token = tokenId
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId: userId
            }
            return db.doc(`/users/${newUser.handle}`).set(userCredentials)
        })
        .then(() => {
            return res.status(201).json({token})
        })
        .catch(err => {
            if(err.code === 'auth/email-already-in-use'){
                return res.status(400).json({email: 'Email already in use'})
            } else{
                console.error(err)
                res.status(500).json({error: err.code})
            }
        })
})

app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }
    let errors = {}
    if(isEmpty(user.email)) errors.email = 'Email must not be empty'
    if(isEmpty(user.password)) errors.password = 'Password must not be empty'
 
    if(Object.keys(errors).length > 0) return res.status(400).json(errors)

    firebase.auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
        return data.user.getIdToken()
    })
    .then(token =>  res.json({token}))
    .catch(err => {
        if(err.code === 'auth/wrong-password'){
            return res.status(403).json({general: 'Incorrect password'})
        } else{
            console.error(err)
            res.status(500).json({error: err.code})
        }
    })
})
exports.api = functions.https.onRequest(app)