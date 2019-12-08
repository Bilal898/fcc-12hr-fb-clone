const functions = require('firebase-functions');
const app = require('express')()
// const firebase = require('firebase')
const { getAllScreams, postOneScream } = require('./handlers/screams')
const {signup, login, uploadImage, getAuthenticatedUser,
    addUserDetails} = require('./handlers/users')
const FBAuth = require('./util/FBAuth')

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

app.get('/screams', getAllScreams)
app.post('/scream', FBAuth, postOneScream)
app.get('/scream/:screamId', getScream)


app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser)
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
exports.api = functions.https.onRequest(app)