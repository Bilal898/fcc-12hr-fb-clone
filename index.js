const { db} = require('./util/admin')
const functions = require('firebase-functions');
const app = require('express')()
// const firebase = require('firebase')
const { getAllScreams, postOneScream, getScream, 
    commentOneScream, likeScream, unlikeScream,
    deleteScream } = require('./handlers/screams')
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
app.delete('/scream/:screamId', FBAuth, deleteScream)

app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser)
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)

exports.api = functions.https.onRequest(app)

exports.createNotificationOnLike = functions.firestore.document('likes/{id}')
    .onCreate(snapshot => {
        return db.doc(`/screams/${snapshot.data().screamId}`)
        .get()
        .then(doc => {
            if(doc.exists){
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    type: 'like',
                    read: false,
                    screamId: doc.id
                })
            }
        })
        .then(() =>{
            return
        })
        .catch(err => {
            console.error(err)
            return     
        })
    })

exports.deleteNotificationOnUnLike  = functions
    .firestore.document('likes/{id}')
    .onDelete(snapshot => {
        return db.doc(`/notifications/${snapshot.id}`)
        .delete()
        .catch(err => {
            console.error(err)
            return     
        })
    })

exports.createNotificationOnComment = functions
    .firestore.document('comments/{id}')
    .onCreate(snapshot => {
        return db.doc(`/screams/${snapshot.data().screamId}`)
        .get()
        .then(doc => {
            if(doc.exists){
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    type: 'comment',
                    read: false,
                    screamId: doc.id
                })
            }
        })
        .then(() =>{
            return
        })
        .catch(err => {
            console.error(err)
            return     
        })
    })