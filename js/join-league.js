import ResilientSDK from 'https://cdn.resilientdb.com/resilient-sdk.js';

const sdk = new ResilientSDK();
var teamName = document.getElementById('teamName');
var joinLeagueBtn = document.getElementById("joinLeagueBtn");
var flag = "account";
sdk.addMessageListener((event) => {
    const messageData = event.data.data;
    var leagueId = document.getElementById('leagueId');
    var id = leagueId.value;
    var idArr = id.split("?r=");
    var recipientPublicKey = idArr[0];
    var ownerKey = idArr[1];
    if(flag==="account"){
         sdk.sendMessage({
            direction: "filter-page-script",
            owner: ownerKey,
            recipient: recipientPublicKey,
        });
        flag="create";
    }
    else if (flag === "create") {
        if (messageData.length > 0) {
            // Compare the publicKey of the first message with the leagueId.value
            if (messageData[0].publicKey === recipientPublicKey) {
                var timeStamp = new Date().getTime();
                sdk.sendMessage({      
                    direction: "commit-page-script",
                    message: `"function": "join","team": "${teamName.value}","leagueId": "${id}","timeStamp": "${timeStamp}"`,
                    amount: 100,
                    address: recipientPublicKey
                });
                flag = "redirect";
            } else {
                alert("League ID does not match.");
            }
        } else {
            alert("No data available to validate League ID.");
        }
    } else if (flag === "redirect") {
        window.location.href = `draft-page.html?link=${id}`;
    }
});

joinLeagueBtn.addEventListener("click", accountContentScript);

function accountContentScript() {
    sdk.sendMessage({
      direction: "account-page-script",
    });
}