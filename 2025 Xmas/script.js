import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const txtGuest = document.getElementById("guest");
const userScore = document.getElementById("user_score");
const leaderboardUsername = document.querySelectorAll(".leaderboard_username");
const leaderboardScore = document.querySelectorAll(".leaderboard_score");
const cells = document.querySelectorAll(".gameboard > div");
const btnGame = document.getElementById("game_btn");
const timer = document.getElementById("game_timer");

let selectedCell = "";

const firebaseConfig = {
    apiKey: "AIzaSyDD2nGigcyd0PYDNwxiE3111yzTEghpH84",
    authDomain: "xmas2025-c2ed5.firebaseapp.com",
    projectId: "xmas2025-c2ed5",
    storageBucket: "xmas2025-c2ed5.firebasestorage.app",
    messagingSenderId: "440835555912",
    appId: "1:440835555912:web:69e8764628ceac7d9cce7d"
};
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

function ListenDatabase(){
    const databaseCollection = collection(database, "Xmas2025");

    onSnapshot(databaseCollection, (docSnapshot) => {
        let data = docSnapshot.docs[0].data();

        // Leaderboard
        for (let rank = 0; rank < 3; rank++) {
            leaderboardUsername[rank].innerText = data.Leaderboard_Guest[rank];
            leaderboardScore[rank].innerText = data.Leaderboard_Score[rank];
        }

        // Guest Number
        let guestNumber = localStorage.getItem("guestNumber");
        if (guestNumber == null) {
            guestNumber = parseInt(data.GuestNumber) + 1;
            data.GuestNumber = guestNumber;
            localStorage.setItem("guestNumber", guestNumber);
            WriteDatabase(data);
        }
        txtGuest.innerText = `Guest ${guestNumber}`;
    });
}
ListenDatabase();

async function WriteDatabase(newData){
    const docRef = doc(database, "Xmas2025", "Xmas2025");
    await setDoc(docRef, newData);
}

async function ReadDatabase(){
    const colRef = collection(database, "Xmas2025");
    const snapshot = await getDocs(colRef);
    return snapshot.docs[0].data();
}

async function UpdateLeaderboardScore(){
    let latestData = await ReadDatabase();
    let leaderboardGuest = latestData.Leaderboard_Guest;
    let leaderboardScore = latestData.Leaderboard_Score;
    let guest = txtGuest.innerText;
    let score = parseInt(userScore.innerText);

    let targetDate = new Date(2025, 11, 26, 12, 0, 0);
    let currentDate = new Date();
    if (currentDate < targetDate) {
        // Insert Score When Higher
        for (let point = 0; point < 3; point++) {
            if (score > parseInt(leaderboardScore[point])) {
                leaderboardGuest.splice(point, 0, guest);
                leaderboardScore.splice(point, 0, score);
                break;
            }
        }

        // Slice Into 3 Index
        latestData.Leaderboard_Guest = leaderboardGuest.slice(0, 3);
        latestData.Leaderboard_Score = leaderboardScore.slice(0, 3);
        WriteDatabase(latestData);
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
