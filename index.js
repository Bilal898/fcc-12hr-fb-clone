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

exports.createScreams = functions.https.onRequest((req, res) => {
    if(req.method !== 'POST'){
        res.status(400).json({error: 'method not allowed'})   
    }
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString
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

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }

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
            return data.user.getIdToken()
        })
        .then(token => {
            return res.status(201).json({token})
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({error: err.code})
        })
})
exports.api = functions.https.onRequest(app)