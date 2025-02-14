let currentsong = new Audio();
let songs;
let currfolder;

async function getSongs(folder) {
  
    currfolder=folder;
    let response = await fetch(`/Spotifyclone/${folder}/`);
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
        }
    }

    let songul = document.querySelector(".songslist ul");
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML += `<li>
                                <img class="invert" src="/Spotifyclone/img/music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>Atharva</div>
                                </div>
                                <div class="playnow">
                                    <span>Play now</span>
                                    <img class="invert" src="/Spotifyclone/img/play.svg" alt="">
                                </div>
                            </li>`;
    }

    Array.from(document.querySelectorAll(".songslist li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentsong.src = `/Spotifyclone/${currfolder}/` + track;
    currentsong.load();
    if (!pause) {
        currentsong.play();
        play.src = "/Spotifyclone/img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    // Display all the albums on the page
    async function displayalbums() {
        let a = await fetch(`/Spotifyclone/songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;

        let anchor = div.getElementsByTagName("a");

        let cardContainer = document.querySelector(".cardcontainer");

        let array = Array.from(anchor);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
            if(e.href.includes("/songs")){
                let folder = e.href.split("/").slice(-2)[0];
                // Getting the metadata of the folder
                
                let a = await fetch(`/Spotifyclone/songs/${folder}/info.json`);
                let response = await a.json();
                console.log(response);
                
                cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="48" height="48" fill="currentColor">
                <circle cx="16" cy="16" r="15" fill="#1DB954" />
                <polygon points="13,10 13,22 23,16" fill="black" />
                </svg>
                </div>
                <img src="/Spotifyclone/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
                </div>`;
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach(e=>{
            e.addEventListener("click", async item=>{
                console.log(item, item.currentTarget.dataset);
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            });
        });
    }

    displayalbums();

    function secondsToMinutesSeconds(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return "00:00";
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "/Spotifyclone/img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "/Spotifyclone/img/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let currentSongName = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.indexOf(currentSongName);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let currentSongName = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.indexOf(currentSongName);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {
        console.log("setting volume to", e.target.value);
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    // Add event listener to mute the track
    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();
