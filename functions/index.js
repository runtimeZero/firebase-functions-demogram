const functions = require('firebase-functions');
const Client = require('node-rest-client').Client;

const client = new Client();


exports.addToFollowing = functions.database.ref('/follow/{initiatorUid}/{interestedInFollowingUid}')
    .onCreate(event => {
        const initiatorUid = event.params.initiatorUid;
        const interestedInFollowingUid = event.params.interestedInFollowingUid;
        const rootRef = event.data.ref.root;
        let FollowingMeRef = rootRef.child('usersFollowingMe/' + interestedInFollowingUid + "/" + initiatorUid);
        return FollowingMeRef.set(true);
    });

const sendLiveMessage = (messageToken, imageName) => {

    console.log('In send Live message', messageToken, imageName);

    const args = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "key=AAAAKvCCLxI:APA91bHaFfGDx9SXygJ2-cdnnnWuhP_bR7pxRqeZ1Y6IPexPMdsnFs-ck7vrb-gSsI-65MY9xUR_G4ffs0PSB3pBt62IAA8LPzF_2WHJ4_EjeRdROru5UFneXTijCPIYLOCZzaJUMgUX"
        },
        data: {
            to: messageToken,
            notification: {
                title: "Congratulations!!",
                body: `Your image ${imageName} has been favorited`
            }

        }
    };

    client.post("https://fcm.googleapis.com/fcm/send", args, (data, response) => {
        console.log(data);
        console.log(response);
    });


};

exports.notifyWhenImageIsFavorited = functions.database.ref('/images/{images}')
    .onUpdate(event => {

        const imageData = event.data.val();

        if (imageData.oldFavoriteCount < imageData.favoriteCount) {

            const uploadedBy = imageData.uploadedBy;
            const rootRef = event.data.ref.root;
            rootRef.child('/users/'+ uploadedBy.uid).once('value')
                .then(snapshot => {
                    const user = snapshot.val();
                    const messageToken = user.messageToken;
                    sendLiveMessage(messageToken, imageData.name);

                });

        }


    });

