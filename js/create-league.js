import ResilientSDK from 'https://cdn.resilientdb.com/resilient-sdk.js';

const sdk = new ResilientSDK();
let recipientPublicKey = null;
var teamName = document.getElementById('teamName');
var maxMembers = document.getElementById('maxMembers'); 
var leagueName = document.getElementById('leagueName');
var createLeagueBtn = document.getElementById("createLeagueBtn");
createLeagueBtn.addEventListener("click", accountContentScript);

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

    return fetch("https://cloud.resilientdb.com/graphql", requestOptions)
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
var flag = "account";

initializePublicKey();
var ownerKey = null;
sdk.addMessageListener((event) => {
    const message = event.data.data;
    if(flag==="account"){
        if (recipientPublicKey) {
            localStorage.setItem("league", leagueName.value);
            localStorage.setItem("members", maxMembers.value);
            localStorage.setItem("teamName", teamName.value);
            localStorage.setItem("leagueId", recipientPublicKey);
            var leagueId = recipientPublicKey+"?r="+message;
            ownerKey = message;
            var timeStamp = new Date().getTime();
            
            sdk.sendMessage({
                direction: "commit-page-script",
                message: `"function": "create","league": "${leagueName.value}","team": "${teamName.value}","members": "${maxMembers.value}","leagueId": "${leagueId}","timeStamp": "${timeStamp}"`,
                amount: 100,
                address: recipientPublicKey
            });
        } else {
            console.error("League not created. Try again!");
        }
        flag = "redirect";
    }else if(flag==="redirect"){
        var leagueId = recipientPublicKey+"?r="+ownerKey;
        window.location.href = `draft-page.html?link=${leagueId}`;
    }
});


function accountContentScript() {
    sdk.sendMessage({
      direction: "account-page-script",
    });
}

const url = 'https://cloud.resilientdb.com/graphql';
const graphqlQuery = `
    query {
        getFilteredTransactions(filter: {
            ownerPublicKey: "5yir5HoVaVAuPGuMC7nX3SeC7a9G8MUH7EkrLVhS9c49"
            recipientPublicKey: "J4WGSUP3XrYLmn8hkL4xQHkyq2DtiGNTmz2uNejPkw11"
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
};

fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
})
.then(response => response.json())
.then(data => {
    localStorage.setItem("data", JSON.stringify(data.data.getFilteredTransactions));
})
.catch(error => {
    console.error('Error:', error);
});

    
  
