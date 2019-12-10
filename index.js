const functions = require('firebase-functions');
const app = require('express')()
// const firebase = require('firebase')
const { getAllScreams, postOneScream, getScream, 
    commentOneScream, likeScream, unlikeScream } = require('./handlers/screams')
const {signup, login, uploadImage, getAuthenticatedUser,
    addUserDetails} = require('./handlers/users')
const FBAuth = require('./util/FBAuth')

// exports.helloWorld = functions.https.onRequest((request, response) => {
//     response.send("Hello from Firebase!");
// });

app.get('/screams', getAllScreams)
app.post('/scream', FBAuth, postOneScream)
app.get('/scream/:screamId', getScream)
app.post('/scream/:screamId/comment', FBAuth, commentOneScream)
app.get('/scream/:screamId/like', FBAuth, likeScream)
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream)

app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser)
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
exports.api = functions.https.onRequest(app)