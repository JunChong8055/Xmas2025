import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, onSnapshot, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const txtGuest = document.getElementById("guest");
const userScore = document.getElementById("user_score");
const leaderboardUsername = document.querySelectorAll(".leaderboard_username");
const leaderboardScore = document.querySelectorAll(".leaderboard_score");
const cells = document.querySelectorAll(".gameboard > div");
const btnGame = document.getElementById("game_btn");
const timer = document.getElementById("game_timer");

let selectedCell = "";

const firebaseConfig = {
    apiKey: "AIzaSyBwrK45CS0tKxOZcVn3-ZEHF4sV1a9p33w",
    authDomain: "junchongminigames.firebaseapp.com",
    projectId: "junchongminigames",
    storageBucket: "junchongminigames.firebasestorage.app",
    messagingSenderId: "468714957594",
    appId: "1:468714957594:web:707d4e7a8a2d46e8fd5aa3"
};
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

function ListenDocument(){
    const databaseDoc = doc(database, "Xmas2025", "GuestData");

    onSnapshot(databaseDoc, (docSnap) => {
        let data = docSnap.data();

        // Leaderboard
        for (let rank = 0; rank < 3; rank++) {
            leaderboardUsername[rank].innerText = data.LeaderboardGuest[rank];
            leaderboardScore[rank].innerText = data.LeaderboardScore[rank];
        }

        // Guest Number
        let guestNumber = localStorage.getItem("guestNumber");
        if (guestNumber == null) {
            guestNumber = parseInt(data.GuestNumber) + 1;
            data.GuestNumber = guestNumber;
            localStorage.setItem("guestNumber", guestNumber);
            WriteDocument(data);
        }
        txtGuest.innerText = `Guest ${guestNumber}`;
    });
}
ListenDocument();

async function WriteDocument(newData){
    const writeDoc = doc(database, "Xmas2025", "GuestData");
    await setDoc(writeDoc, newData);
}

async function ReadDocument(){
    const readDoc = doc(database, "Xmas2025", "GuestData");
    const snap = await getDoc(readDoc);
    return snap.data();
}

async function UpdateLeaderboardScore(){
    let latestData = await ReadDocument();
    let leaderboardGuest = latestData.LeaderboardGuest;
    let leaderboardScore = latestData.LeaderboardScore;
    let guest = txtGuest.innerText;
    let score = parseInt(userScore.innerText);

    // Insert Score When Higher
    for (let point = 0; point < 3; point++) {
        if (score > parseInt(leaderboardScore[point])) {
            leaderboardGuest.splice(point, 0, guest);
            leaderboardScore.splice(point, 0, score);
            break;
        }
    }

    // Slice Into 3 Index
    if (leaderboardGuest.length > 3)
    {
        latestData.LeaderboardGuest = leaderboardGuest.slice(0, 3);
        latestData.LeaderboardScore = leaderboardScore.slice(0, 3);
        WriteDocument(latestData);
    }
}

function ResetScore(){
    userScore.innerText = 0;
}

function AddScore(index){
    let orginalScore = parseInt(userScore.innerText);
    let newScore = (index == 5) ? 50 : Math.pow(2, index);
    userScore.innerText = orginalScore + newScore;
}

function GenerateImage(){
    let hasEmptyCell = false;
    let randomNumber;
    let generateImageCellContent, generateImageCellIndex, generateImageGroup, generateImageIndex, generateImage;

    // Check Gameboard Has Space
    for (let cellIndex = 0; cellIndex < 25; cellIndex++) {
        if (cells[cellIndex].innerHTML == "") {
            hasEmptyCell = true;
            break;
        }
    }

    // Gameboard Has Space
    if (hasEmptyCell) {
        // Random Generate Cell
        do
        {
            generateImageCellIndex = Math.floor(Math.random() * 25);
            generateImageCellContent = cells[generateImageCellIndex].innerHTML;
        }while(generateImageCellContent != "");

        // Random Generate Image Group
        generateImageGroup = String.fromCharCode("A".charCodeAt(0) + Math.floor(Math.random() * 4));

        // Random Generate Image Index
        randomNumber = Math.random() * 100;
        if (randomNumber < 30)
            generateImageIndex = 1;
        else if (randomNumber < 95)
            generateImageIndex = 0;
        else
            generateImageIndex = 2;
        generateImage = generateImageGroup + generateImageIndex;

        // Display Image On The Cell
        cells[generateImageCellIndex].innerHTML = `<img src="Images/${generateImage}.png">`;
        AddScore(generateImageIndex);
    }
}

function RandomGenerateImage(){
    for(let attempt = 0; attempt < 10; attempt++)
        GenerateImage();
}

function GameLogic(event){
    const cell = event.currentTarget;
    let image, imageName, imageGroup, imageIndex;
    let isImageIndex5 = false;

    if (cell.innerHTML != "") {
        image = cell.querySelector("img");
        imageName = image.src.split("/").pop().split(".")[0];
        imageGroup = imageName[0];
        imageIndex = parseInt(imageName.substring(1));
        isImageIndex5 = (imageIndex == 5);
    }

    if (!isImageIndex5) {
        // First Click
        if (selectedCell == "") {
            // Cell Has Image
            if (cell.innerHTML != "") {
                selectedCell = cell;
                cell.classList.add("selected");
            }
        }
        // Second Click
        else {
            // Click Different Cell
            if (cell != selectedCell) {
                // Both Image Are Same (Upgrade)
                if (cell.innerHTML == selectedCell.innerHTML) {
                    image.src = `Images/${imageGroup + (imageIndex + 1)}.png`;
                    selectedCell.innerHTML = "";
                    
                    // Click Cell Image Index 4
                    if (imageIndex == 4) {
                        cell.classList.add("success");
                        setTimeout(() => {
                            cell.innerHTML = ""; 
                            cell.classList.remove("success");
                        }, 1500);
                    }

                    AddScore(imageIndex + 1);
                }
                // Both Image Are Different (Exchange Place)
                else {
                    let temp = cell.innerHTML;
                    cell.innerHTML = selectedCell.innerHTML;
                    selectedCell.innerHTML = temp;
                }
            }
            selectedCell.classList.remove("selected");
            selectedCell = "";
        }
    }
}

function ClearGameboard(){
    selectedCell = "";
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove("selected");
    });
}

function AddGameboardInteraction(){
    cells.forEach(cell => {
        cell.addEventListener("click", GameLogic);
    });
}

function RemoveGameboardInteraction(){
    cells.forEach(cell => {
        cell.removeEventListener("click", GameLogic);
    });
}

function ResetTimer(){
    timer.textContent = 120;
}

function StartTimer(){
    let timerRun = setInterval(() => {
        timer.textContent = timer.textContent - 1;
        if (timer.textContent == 0)
        {
            StopTimer();
            clearInterval(timerRun);
        }
    },1000);
}

function StopTimer(){
    btnGame.children[0].textContent = "END";
    RemoveGameboardInteraction();
    UpdateLeaderboardScore();
}

// Game Button Control
btnGame.addEventListener("click", () => {
    let btnText = btnGame.children[0].textContent;
    if (btnText == "END") {
        btnGame.children[0].textContent = "START";
        ClearGameboard();
        ResetScore();
        ResetTimer();
    }
    else if (btnText == "START") {
        btnGame.children[0].textContent = "GENERATE";
        RandomGenerateImage();
        AddGameboardInteraction();
        StartTimer();
    }
    else {
        GenerateImage();
    }
});

