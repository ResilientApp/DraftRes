import ResilientSDK from 'https://cdn.resilientdb.com/resilient-sdk.js';

const sdk = new ResilientSDK();
var league = localStorage.getItem("league");
var timePerPick = localStorage.getItem("time");
var maxMembers = localStorage.getItem("members");
var refreshLeagueBtn = document.getElementById("refreshLeagueBtn");
var data = JSON.parse(localStorage.getItem("data"));

console.log(data, "player data");

var assetTable = document.getElementById("assetTable").getElementsByTagName('tbody')[0];

data.sort((a, b) => {
    const overallA = getOverall(a.asset);
    const overallB = getOverall(b.asset);
    return overallB - overallA; // Sort in descending order
});

function getOverall(assetString) {
    try {
        const assetData = JSON.parse(assetString.replace(/'/g, "\""));
        return assetData.data.Overall || 0; // Return 0 if 'Overall' is not present in the asset data
    } catch (error) {
        console.error("Error parsing 'asset' field:", error);
        return 0; // Return 0 in case of an error
    }
}

var currentPage = 1;
var rowsPerPage = 7;

function displayPage(page) {
    var start = (page - 1) * rowsPerPage;
    var end = start + rowsPerPage;

    Array.from(assetTable.rows).forEach((row, index) => {
        row.style.display = (index >= start && index < end) ? '' : 'none';
    });

    currentPage = page;
    updatePageNumbers();
}

function updatePageNumbers() {
    var pageNumberContainer = document.getElementById('pageNumberContainer');
    pageNumberContainer.innerHTML = '';

    var totalRows = assetTable.rows.length;
    var maxPage = Math.ceil(totalRows / rowsPerPage);
    var pageRange = 5;
    var startPage, endPage;

    if (maxPage <= pageRange) {
        startPage = 1;
        endPage = maxPage;
    } else {
        var maxPivotPages = Math.floor(pageRange / 2);
        startPage = currentPage - maxPivotPages;
        endPage = currentPage + maxPivotPages;

        if (startPage < 1) {
            startPage = 1;
            endPage = pageRange;
        } else if (endPage > maxPage) {
            endPage = maxPage;
            startPage = maxPage - pageRange + 1;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        var pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('page-number');

        if (i === currentPage) {
            pageButton.classList.add('active');
        }

        pageButton.addEventListener('click', function() {
            displayPage(i);
        });

        pageNumberContainer.appendChild(pageButton);
    }
}
function populateTable(dataToDisplay) {
    while (assetTable.rows.length > 0) {
        assetTable.deleteRow(0);
    }

    dataToDisplay.forEach(function(item, index) {
        // Check if the item has an 'asset' field and it's a non-empty string
        if (item.asset && typeof item.asset === 'string') {
          try {
            // Parse the 'asset' field as JSON
            var assetData = JSON.parse(item.asset.replace(/'/g, "\""));
    
            // Create a new row in the table for each asset
            var row = assetTable.insertRow();
            var columns = ['Photo', 'Name', 'Age', 'Nationality', 'Overall', 'Potential', 'Club', 'Preferred Foot', 'Weak Foot', 'Skill Moves', 'Position'];
            columns.forEach(function(column) {
                var cell = row.insertCell();
                //cell.textContent = assetData.data[column];
                if (column === 'Photo') {
                    // If the column is 'Photo', create an img element
                    var img = document.createElement('img');
                    img.src = assetData.data[column]; // Set the src attribute to the image URL
                    cell.appendChild(img); // Add the img element to the table cell
                  } else {
                    // Otherwise, display the text data
                    cell.textContent = assetData.data[column];
                  }
              });
            
            // Add a new cell for the "Draft" button
            var draftCell = row.insertCell();
            var draftButton = document.createElement('button');
            draftButton.textContent = 'Draft';
            draftButton.classList.add('btn', 'btn-success'); 
            draftButton.addEventListener('click', function() {
                console.log(`Player drafted: ${assetData.data.Name}`);
            });
            draftCell.appendChild(draftButton);
            console.log(`Asset Information for Item ${index + 1}:`);
            console.log(assetData.data); // This will display the 'data' field inside 'asset'
            console.log('\n');
          } catch (error) {
            console.error(`Error parsing 'asset' field for Item ${index + 1}:`, error);
          }
        }
      });

    updatePageNumbers();
}

var searchInput = document.getElementById('playerSearch'); 

function searchPlayers() {
    var searchText = searchInput.value.toLowerCase();
    var filteredData = searchText ? data.filter(item => {
        return item.asset && item.asset.toLowerCase().includes(searchText);
    }) : data;

    populateTable(filteredData);
    displayPage(1);
}

searchInput.addEventListener('input', searchPlayers);

populateTable(data);
displayPage(currentPage);

document.getElementById('prevButton').addEventListener('click', function() {
    if (currentPage > 1) {
        displayPage(currentPage - 1);
    }
});

document.getElementById('nextButton').addEventListener('click', function() {
    var totalRows = assetTable.rows.length;
    var maxPage = Math.ceil(totalRows / rowsPerPage);
    if (currentPage < maxPage) {
        displayPage(currentPage + 1);
    }
});

// Function to create the round blocks
function createRoundBlock(roundNumber, maxMembers) {
    // Function to get initials from a name
    function getInitials(name) {
        return name.split(' ').map(part => part[0]).join('').toUpperCase();
    }

    // Round container
    const roundContainer = document.createElement('div');
    roundContainer.className = 'round-container';

    // Round label
    const roundLabel = document.createElement('div');
    roundLabel.className = 'round-label';
    roundLabel.innerHTML = `<div class="rotate90">Round ${roundNumber}</div>`;
    roundContainer.appendChild(roundLabel);

    // Create player blocks for the round
    for (let i = 1; i <= maxMembers; i++) {
        const playerBlock = document.createElement('div');
        playerBlock.className = 'player-block';

        playerBlock.innerHTML = `
            <div class="player-info">${ordinalSuffixOf(i)}</div>
            <div class="player-initials">XX</div>
            <div class="player-info2">Pending</div>
        `;
        roundContainer.appendChild(playerBlock);
    }

    return roundContainer;
}

// Function to add ordinal suffix to numbers
function ordinalSuffixOf(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

// Function to update the countdown display
function updateCountdownDisplay(seconds, countdownElement) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    remainingSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

    if (hours > 0) {
        countdownElement.textContent = `${hours}:${minutes}:${remainingSeconds}`;
    } else {
        countdownElement.textContent = `${minutes}:${remainingSeconds}`;
    }
}

function initializeDraftPage() {
    
    const numberOfRounds = 12; // Set this to the desired number of rounds
    const draftRoundsElement = document.getElementById('draftRounds');
    let currentPlayer = 1; // Start with the first player
    let currentRound = 1; // Start with the first round

    // Create blocks for all rounds
    for (let roundNumber = 1; roundNumber <= numberOfRounds; roundNumber++) {
        const roundBlock = createRoundBlock(roundNumber, maxMembers);
        draftRoundsElement.appendChild(roundBlock);
    }

    function highlightCurrentPlayer() {
        // Reset background color for all player-info elements
        document.querySelectorAll('.player-block .player-info').forEach(element => {
            element.style.backgroundColor = ''; // reset to default
        });
    
        // Calculate the index of the player block in the round container
        let playerBlockIndex = currentPlayer + 1; // +1 due to the round label being the first child
    
        // Highlight the current player
        const currentPlayerBlock = document.querySelector(`.round-container:nth-child(${currentRound}) .player-block:nth-child(${playerBlockIndex}) .player-info`);
        if (currentPlayerBlock) {
            currentPlayerBlock.style.backgroundColor = '#198754';
        }
    }
    

    function startCountdownForPlayer() {
        // Highlight current player
        highlightCurrentPlayer();
        document.getElementById('currentRound').textContent = currentRound;
        document.getElementById('currentPick').textContent = currentPlayer;
    
        const countdownElement = document.getElementById('countdown');
    
        // Function to start the regular countdown
        function startRegularCountdown() {
            let countdownTimer = parseInt(timePerPick, 10);
            updateCountdownDisplay(countdownTimer, countdownElement);
    
            const interval = setInterval(function() {
                countdownTimer -= 1;
                updateCountdownDisplay(countdownTimer, countdownElement);
    
                if (countdownTimer <= 0) {
                    clearInterval(interval);
                    currentPlayer++;
                    if (currentPlayer <= maxMembers) {
                        startCountdownForPlayer(); // Start next player's countdown
                    } else {
                        currentPlayer = 1; // Reset to first player for next round
                        currentRound++;
                        if (currentRound <= numberOfRounds) {
                            startCountdownForPlayer();
                        } else {
                            countdownElement.textContent = "DRAFT COMPLETED";
                        }
                    }
                }
            }, 1000);
        }
    
        // Check if it's the first player of the first round
        if (currentRound === 1 && currentPlayer === 1) {
            let bufferTime = 60; // 60 seconds buffer
            const bufferInterval = setInterval(() => {
                bufferTime -= 1;
                countdownElement.textContent = `Waiting: ${bufferTime} seconds`;
                if (bufferTime <= 0) {
                    clearInterval(bufferInterval);
                    startRegularCountdown();
                }
            }, 1000);
        } else {
            startRegularCountdown();
        }
    }
    

    // Start the countdown for the first player in the first round
    startCountdownForPlayer();
}

// Add event listeners
document.addEventListener('DOMContentLoaded', initializeDraftPage);
refreshLeagueBtn.addEventListener('click', filterContentScript);
var currentPageUrl = window.location.href;
var urlParams = new URLSearchParams(new URL(currentPageUrl).search);

var linkValue = urlParams.get('link');
function filterContentScript() {
    sdk.sendMessage({
        direction: "filter-page-script",
        owner: "E9i5MnApcy8nZ4JNkAghSBHSX7Kkv869dzf32q5hPoYB",
        recipient: linkValue,
    });
}

sdk.addMessageListener((event) => {
    
    const messages = event.data.data;
    function sortMessagesByTimestamp(messages) {
        return messages.sort((a, b) => {
            const assetA = JSON.parse(a.asset.replace(/'/g, '"'));
            const assetB = JSON.parse(b.asset.replace(/'/g, '"'));
            
            const timestampA = parseInt(assetA.data.timeStamp, 10);
            const timestampB = parseInt(assetB.data.timeStamp, 10);
    
            return timestampA - timestampB; // Sorts in ascending order
        });
    }
    
    const sortedMessages = sortMessagesByTimestamp(messages);
    
    sortedMessages.forEach((message, index) => {
        try {
            let correctedJson = message.asset.replace(/'/g, "\"").replace(/(\w+):/g, '"$1":');
            const assetData = JSON.parse(correctedJson);
            
            if (assetData.data.leagueId === linkValue) {
                const teamName = assetData.data.team;
                const playerNumber = (index % maxMembers) + 1; // Calculate player number

                // Update this player in each round
                for (let roundNumber = 1; roundNumber <= 12; roundNumber++) {
                    const playerBlockSelector = `.round-container:nth-of-type(${roundNumber}) .player-block:nth-child(${playerNumber + 1}) .player-info2`;
                    const playerBlock = document.querySelector(playerBlockSelector);

                    const playerBlockSelectorInitials = `.round-container:nth-of-type(${roundNumber}) .player-block:nth-child(${playerNumber + 1}) .player-initials`;
                    const playerBlockInitials = document.querySelector(playerBlockSelectorInitials);

                    if (playerBlock && playerBlockInitials) {
                        playerBlock.textContent = teamName;
                        playerBlockInitials.textContent = getInitials(teamName);
                    }

                }
            }
        } catch (e) {
            console.error("Error parsing message asset:", e);
        }
    });
});
function getInitials(name) {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
}