import ResilientSDK from 'https://cdn.resilientdb.com/resilient-sdk.js';

const sdk = new ResilientSDK();
let recipientPublicKey = null;



function initializePublicKey() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var graphql = JSON.stringify({
        query: "mutation { generateKeys {\n  publicKey\n  privateKey\n  } \n}",
        variables: {}
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: graphql,
        redirect: 'follow'
    };

    return fetch("http://cloud.draftres.pro/graphql", requestOptions)
        .then(response => response.json())
        .then(data => {
            if (data && data.data && data.data.generateKeys) {
                recipientPublicKey = data.data.generateKeys.publicKey;
            } else {
                throw new Error('No data found');
            }
        })
        .catch(error => {
            console.error('Error fetching public key:', error);
        });
}

initializePublicKey();
sdk.addMessageListener((event) => {
    const message = event.data.data;
    alert(JSON.stringify(message));

    if (recipientPublicKey) {
       window.location.href = `draft-page.html?link=${recipientPublicKey}`;
        
        sdk.sendMessage({
            direction: "get-page-script",
            id: JSON.stringify(message)
        });

       
        
    } else {
        console.error("Public key not initialized");
    }
});

var teamName = document.getElementById('teamName');
var timePerPick = document.getElementById('timePerPick');
var maxMembers = document.getElementById('maxMembers'); 
var leagueName = document.getElementById('leagueName');
var createLeagueBtn = document.getElementById("createLeagueBtn");

createLeagueBtn.addEventListener("click", commitContentScript);

function commitContentScript() {
    if (recipientPublicKey) {
        localStorage.setItem("league", leagueName.value);
        localStorage.setItem("time", timePerPick.value);
        localStorage.setItem("members", maxMembers.value);
        localStorage.setItem("leagueId", recipientPublicKey);

        var timeStamp = new Date().getTime();
        
        sdk.sendMessage({
            direction: "commit-page-script",
            message: `"league": "${leagueName.value}","team": "${teamName.value}","time": "${timePerPick.value}","members": "${maxMembers.value}","leagueId": "${recipientPublicKey}","timeStamp": "${timeStamp}"`,
            amount: 100,
            address: recipientPublicKey
        });
    } else {
        console.error("Public key not initialized");
    }
}


    console.log("entered");
    const url = 'http://cloud.draftres.pro/graphql';
    const graphqlQuery = `
        query {
            getFilteredTransactions(filter: {
                ownerPublicKey: "B2s9zdNwXXkuJR1nPGHG2eR8L6zVHiYhqP2e4UDy76sC"
                recipientPublicKey: "GKKoh6vUaNVQd7fbkuuAWyRgYcdPbDLELVWfsNyRFbZj"
            }) {
                id
                version
                amount
                metadata
                operation
                asset
                publicKey
                uri
                type
            }
        }
    `;
  
    const payload = {
        query: graphqlQuery
    };
  
    const headers = {
        'Content-Type': 'application/json',
        // Add any other headers as needed (e.g., authorization headers)
    };
  
    fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        console.log("test");
        console.log(data);
        localStorage.setItem("data", JSON.stringify(data.data.getFilteredTransactions));
    })
    .catch(error => {
        console.error('Error:', error);
    });

    
  
