var config = {
    apiKey: "AIzaSyAM6aGxYW6w3ylXMZvDR78TUuegnM_4fFw",
    authDomain: "chatback-7beeb.firebaseapp.com",
    databaseURL: "https://chatback-7beeb.firebaseio.com",
    projectId: "chatback-7beeb",
    storageBucket: "chatback-7beeb.appspot.com",
    messagingSenderId: "402632258272"
};
firebase.initializeApp(config);

var $usernameForm = $("#usernameForm");
var $username = $("#username");
// var loginButton = document.querySelector('#login');
// var logoutButton = document.querySelector('#logout');
var $mainWrapper = $("#mainWrapper");
var $namesWrapper = $("#namesWrapper");
var $about = $('#about');
var chatWindow = document.querySelector('#chatWindow');
var textarea = document.querySelector("#textarea");
var ready = document.querySelector("#ready");
var lastOuterButtonClicked;
var chatId = "";
var username = "";
var ownUserId = "";
var promptcount = 0;

// logoutButton.style.display = "none";

$usernameForm.submit(function(e) {
	e.preventDefault();
    username = $username.val();
	if(username != "") {
		$("#namesWrapper").hide();
		$("#mainWrapper").show();
		$("#about").show();
        createUserData(username);
	}
});

// loginButton.addEventListener("click", function() {
//     var provider = new firebase.auth.GoogleAuthProvider();
//     firebase.auth().signInWithPopup(provider).then(function(result) {
//         if (result.credential) {
//             var token = result.credential.accessToken;
//         }
//         var user = result.user;
//     }).catch(function(error) {
//         var errorCode = error.code;
//         var errorMessage = error.message;
//         var email = error.email;
//         var credential = error.credential;
//     });
// });

textarea.addEventListener('keyup', function(event) {
    var text = textarea.value;
    if (event.which === 13 && event.shiftKey == false && text.length !== 1 && chatId != '') {
        var messageRef = firebase.database().ref('chats/' + chatId).child('messages');
        messageRef.push().set({
            author: username,
            id: ownUserId,
            text: text,
            timestamp: Date.now()
        })
        textarea.value = "";
    }
});

var buttons = document.querySelectorAll(".button");
for (var i = 0; i < buttons.length; i++) {
    var button = buttons[i];
    button.addEventListener('click', function() {
        if (!textarea.value.includes(this.value)) {
            textarea.value += this.value;
        }
        if (this.classList.contains("outer")) {
            if (promptcount === 0) {
                document.getElementById("concernouter").classList.add("hidden");
            } else if (promptcount === 4) {
                document.getElementById("wantouter").classList.add("hidden");
            } else if (promptcount === 12) {
                document.getElementById("feelingouter").classList.add("hidden");
            }
            document.getElementById(this.innerHTML).classList.remove("hidden");
            lastOuterButtonClicked = this.innerHTML;
        }
    });
}
// Adds functionality for all inner back buttons to return to outer buttons
var backButtons = document.querySelectorAll(".back");
for (var i = 0; i < backButtons.length; i++) {
    var button = backButtons[i];
    button.addEventListener('click', function() {
        if (promptcount === 0) {
            document.getElementById(lastOuterButtonClicked).classList.add("hidden");
            document.getElementById("concernouter").classList.remove("hidden");
        } else if (promptcount === 4) {
            document.getElementById(lastOuterButtonClicked).classList.add("hidden");
            document.getElementById("wantouter").classList.remove("hidden");
        } else if (promptcount === 12) {
            document.getElementById(lastOuterButtonClicked).classList.add("hidden");
            document.getElementById("feelingouter").classList.remove("hidden");
        }
    });
}
// Sends ready for next prompt message to server
ready.addEventListener('click', function() {
    if (promptcount > 16) {
        if (confirm("Are you sure you want to leave the chat?") == true) {
            window.location.reload();
        }
    } else {
        var chatRef = firebase.database().ref('chats/' + chatId);
        var messageRef = chatRef.child('messages').push().set({
            author: 'Chatback',
            text: username + ' is ready for the next prompt',
            timestamp: Date.now()
        });
        var readyObject = {};
        readyObject[ownUserId] = true;
        var readyRef = chatRef.child('ready').push().set(readyObject);
    }
});

// firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//         username = user.displayName;
//         loginButton.textContent = "Logged in as " + username;
//         loginButton.disabled = true;
//         logoutButton.style.display = "block";
//         mainWrapper.style.display = "block";
//         aboutSection.style.display = "block";
//         startTitle.style.display = "none";
//         createUserData(user);
//     }
// });

// logoutButton.addEventListener("click", function() {
//     if (confirm("Are you sure you want to leave the chat?") == true) {
//         removeUserData();
//         firebase.auth().signOut().then(function() {
//             // Sign-out successful.
//             loginButton.textContent = "Login with Google";
//             loginButton.disabled = false;
//             logoutButton.style.display = "none";
//             mainWrapper.style.display = "none";
//             aboutSection.style.display = "none";
//             startTitle.style.display = "block";
//         }).catch(function(error) {
//             console.log(error);
//         });
//     }
// });

function createUserData(name) {
    // ownUserId = user.email.split(".")[0];
    // userName = user.displayName;
    // var userRef = firebase.database().ref('matchedUsers/');
    // return userRef.child(ownUserId).once('value', ((snapshot) => {
    //     var foundUser = snapshot.val() != null;
    //     var willCreateUser = new Promise((resolve, reject) => {
    //         if (!foundUser) {
    //             resolve(foundUser);
    //         }
    //     })
    //
    //     var createUser = () => {
    //         willCreateUser
    //             .then(() => {
    //                 firebase.database().ref('unmatchedUsers/' + ownUserId).set({
    //                     name: userName
    //                 });
    //                 var unmatchedUsersRef = firebase.database().ref('unmatchedUsers/');
    //                 unmatchedUsersRef.on('value', ((snapshot) => {
    //                     if (snapshot.numChildren() === 2) {
    //                         matchUsers(snapshot);
    //                     }
    //                 }));
    //             })
    //     }
    //     createUser();
    // }));

    if (name !== '') {
        console.log();
        var userRef = firebase.database().ref('unmatchedUsers/').push();
        ownUserId = userRef.key;
        return userRef.update({
            name: name
        })

        .then(() => {
            var unmatchedUsersRef = firebase.database().ref('unmatchedUsers/');
            return unmatchedUsersRef.on('value', ((snapshot) => {
                if (snapshot.numChildren() === 2) {
                    matchUsers(snapshot);
                }
            }));
        })

    }
}

var matchUsers = (snapshot) => {
    var children = snapshot.val();
    for (var key in children) {
        chatId += key + '&';
    }
    for (var key in children) {
        var user = children[key];
        checkIfUserIsMatched(key, user.name);
    }
}

var checkIfUserIsMatched = (userId, name) => {
    var userRef = firebase.database().ref('matchedUsers/');
    return userRef.child(userId).once('value', ((snapshot) => {
        var userIsMatched = snapshot.val() != null;
        var willMatchUser = new Promise((resolve, reject) => {
            if (!userIsMatched) {
                resolve(userIsMatched);
            }
        })

        var matchUser = () => {
            willMatchUser
                .then(() => {
                    firebase.database().ref('matchedUsers/' + userId).set({
                        name: name,
                        chatId: chatId
                    });
                    var userObject = {};
                    userObject[name] = userId;
                    chatWindow.innerHTML = "";
                    var firstText = 'Welcome, chat partners! I’ll give you prompts and you’ll answer them, typing at the same time. Here’s the first prompt...'
                    var secondText = 'Express your concerns to each other, "I’m concerned that..." Then, choose a type of concern you’re having (from the blue buttons).'
                    var messages = {
                        messages: [{
                                author: 'Chatback',
                                text: firstText,
                                timestamp: Date.now()
                            },
                            {
                                author: 'Chatback',
                                text: secondText,
                                timestamp: Date.now()
                            }
                        ]
                    };
                    var chatRef = firebase.database().ref('chats/' + chatId);
                    chatRef.child('users').child(userId).set(name);
                    chatRef.update(messages);
                    firebase.database().ref('unmatchedUsers/' + userId).remove();
                    startMessageListener();
                    startReadyListener();
                });
        }
        matchUser();
    }));
}

var startMessageListener = () => {
    if (chatId !== '') {
        firebase.database().ref('chats/' + chatId).child('messages').on('child_added', (snapshot) => {
            var msg = snapshot.val();
            var id = snapshot.key;
            if (document.getElementById(id) == null) {
                var chatText = document.createElement('p');
                chatText.innerHTML = '<strong><em>' + msg.author + ':</strong> ' + msg.text + '</em>';
                chatText.setAttribute('id', id);
                chatWindow.appendChild(chatText);
                chatWindow.scrollTop = chatWindow.scrollHeight;
            }
        })
    }
};

var startReadyListener = () => {
    if (chatId != '') {
        var readyRef = firebase.database().ref('chats/' + chatId).child('ready');
        readyRef.on('value', (snapshot) => {
            var readyCount = snapshot.numChildren();
            if (readyCount == 2) {
                promptcount++;
                var newPrompt = "";
                var sendPrompt = false;
                textarea.value = "";

                if (promptcount === 2) {
                    sendPrompt = true;
                    newPrompt = 'Read each other’s concerns, and reply "You’re concerned that..."';
                    document.getElementById("concernouter").classList.add("hidden");
                    if (!document.getElementById(lastOuterButtonClicked).classList.contains("hidden")) {
                        document.getElementById(lastOuterButtonClicked).classList.add("hidden");
                    }
                } else if (promptcount === 4) {
                    sendPrompt = true;
                    newPrompt = 'Say how you want things to be different, "I want...". Then, choose a type of feeling you want and say why.';
                    document.getElementById("wantouter").classList.remove("hidden");
                } else if (promptcount === 6) {
                    sendPrompt = true;
                    newPrompt = 'Read each other’s wants, and reply: "You want..."';
                    document.getElementById("wantouter").classList.add("hidden");
                    if (!document.getElementById(lastOuterButtonClicked).classList.contains("hidden")) {
                        document.getElementById(lastOuterButtonClicked).classList.add("hidden");
                    }
                } else if (promptcount === 8) {
                    sendPrompt = true;
                    newPrompt = 'Share your thoughts about the situation, "I’m thinking...". Choose a type of distressing thought you’re having and how it affects you.';
                    document.getElementById("thought").classList.remove("hidden");
                } else if (promptcount === 10) {
                    sendPrompt = true;
                    newPrompt = 'Read their thoughts, and reply: "I hear..."';
                    document.getElementById("thought").classList.add("hidden");
                } else if (promptcount === 12) {
                    sendPrompt = true;
                    newPrompt = 'Describe your feelings about your distressing thoughts, "I’m feeling...". Choose a type of troubling feeling you’re having and express its connection to your thought.';
                    document.getElementById("feelingouter").classList.remove("hidden");
                } else if (promptcount === 14) {
                    sendPrompt = true;
                    newPrompt = 'Read their feelings, and reply: "You’re feeling..." (Only two more prompts to go!)';
                    document.getElementById("feelingouter").classList.add("hidden");
                    if (!document.getElementById(lastOuterButtonClicked).classList.contains("hidden")) {
                        document.getElementById(lastOuterButtonClicked).classList.add("hidden");
                    }
                } else if (promptcount === 16) {
                    sendPrompt = true;
                    newPrompt = 'Suggest one thing your chat partner can try: "I’d try [in your situation]...". Then, click "Next prompt" for the LAST prompt.'
                } else if (promptcount > 16) {
                    sendPrompt = true;
                    newPrompt = 'Say what you’ll try next -- you can use the suggestion buttons below to help you. Then, thank your chat partner :)'
                    document.getElementById("strategy").classList.remove("hidden");
                    document.getElementById("ready").innerHTML = "Leave chat";
                }
                if (sendPrompt && promptcount % 2 == 0) {
                    var messageRef = firebase.database().ref('chats/' + chatId + '/messages/prompt' + promptcount);
                    messageRef.set({
                        author: 'Chatback',
                        text: newPrompt,
                        timestamp: Date.now()
                    });
                }
                readyRef.remove();
            }
        })
    }
};

var removeUserData = () => {
    exportUserData();
    if (ownUserId !== '') {
        var chatRef = firebase.database().ref('chats/' + chatId);
        firebase.database().ref('matchedUsers/').child(ownUserId).remove();
        firebase.database().ref('unmatchedUsers/').child(ownUserId).remove();
        chatRef.child(ownUserId).remove();
        var messageRef = chatRef.child('messages');
        if (chatId !== '') {
            var newChildRef = messageRef.push().set({
                author: 'Chatback',
                text: 'Partner has disconnected. Please refresh to chat again.',
                timestamp: Date.now()
            });
        }
        chatId = '';
        ownUserId = '';
    }
}

var exportUserData = () => {
    if (chatId !== '') {
        var messageRef = firebase.database().ref('chats/' + chatId).child('messages');
        var userIds = chatId.split('&');
        var partnerId = userIds[0] === ownUserId ? userIds[1] : userIds[0];
        messageRef.once('value', (snapshot) => {
            var messages = snapshot.val();
            firebase.firestore().collection("chatlogs").add({
                    userId: ownUserId,
                    partnerId: partnerId,
                    messages: messages
                })
                .then((docRef) => {
                    console.log("Document written with ID: ", docRef.id);
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                });
        })
    }
}

window.onbeforeunload = removeUserData;
