// ==========================
// Get DOM elements
// ==========================
const fileInput = document.getElementById("file-input");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const coverEl = document.getElementById("cover");
const progressContainer = document.getElementById("progress-container");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const volumeSlider = document.getElementById("volume");
const playlistEl = document.getElementById("playlist");

let songs = [];
let songIndex = 0;
let isPlaying = false;

// ==========================
// Default Songs
// ==========================
const defaultSongs = [
  { file: 'songs/Fear.mp3' },
  { file: 'songs/Chuttamalle.mp3' },
  { file: 'songs/Titanic.mp3' }
];

// ==========================
// Helper: Load song via jsmediatags
// ==========================
async function loadSongWithTags(filePath, index) {
  try {
    // Fetch file as blob
    const response = await fetch(filePath);
    const blob = await response.blob();
    const file = new File([blob], filePath, { type: blob.type });

    jsmediatags.read(file, {
      onSuccess: function(tag) {
        let picture = null;
        if(tag.tags.picture){
          const bytes = tag.tags.picture.data;
          const format = tag.tags.picture.format;
          let base64String = "";
          for(let i=0;i<bytes.length;i++){
            base64String += String.fromCharCode(bytes[i]);
          }
          picture = `data:${format};base64,${btoa(base64String)}`;
        }

        const song = {
          fileURL: filePath,
          title: tag.tags.title || `Song ${index+1}`,
          artist: tag.tags.artist || "Unknown Artist",
          cover: picture || 'images/placeholder.png'
        };
        songs.push(song);

        if(songs.length === defaultSongs.length){
          renderPlaylist();
          loadSong(songs[0]);
        }
      },
      onError: function() {
        const song = {
          fileURL: filePath,
          title: `Song ${index+1}`,
          artist: "Unknown Artist",
          cover: 'images/placeholder.png'
        };
        songs.push(song);
        if(songs.length === defaultSongs.length){
          renderPlaylist();
          loadSong(songs[0]);
        }
      }
    });

  } catch (err) {
    console.error("Error loading song:", err);
  }
}

// Load all default songs
defaultSongs.forEach((s,i) => loadSongWithTags(s.file, i));

// ==========================
// Load a Song
// ==========================
function loadSong(song){
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  coverEl.src = song.cover || 'images/placeholder.png';
  audio.src = song.fileURL;
}

// ==========================
// Play/Pause
// ==========================
function playSong(){ 
  isPlaying=true; 
  try { audio.play(); } catch(e) { console.log("Playback interrupted", e); }
  playBtn.textContent="⏸"; 
}
function pauseSong(){ 
  isPlaying=false; 
  audio.pause(); 
  playBtn.textContent="▶"; 
}

// ==========================
// Next/Previous
// ==========================
function nextSong(){ 
  songIndex=(songIndex+1)%songs.length; 
  loadSong(songs[songIndex]); 
  playSong(); 
}
function prevSong(){ 
  songIndex=(songIndex-1+songs.length)%songs.length; 
  loadSong(songs[songIndex]); 
  playSong(); 
}

// ==========================
// Progress Bar
// ==========================
function updateProgress(e){
  if(audio.duration){
    const {duration, currentTime}=e.srcElement;
    progress.style.width=`${(currentTime/duration)*100}%`;
    currentTimeEl.textContent=`${Math.floor(currentTime/60)}:${Math.floor(currentTime%60).toString().padStart(2,'0')}`;
    durationEl.textContent=`${Math.floor(duration/60)}:${Math.floor(duration%60).toString().padStart(2,'0')}`;
  }
}
function setProgress(e){
  const width=this.clientWidth;
  audio.currentTime=(e.offsetX/width)*audio.duration;
}

// ==========================
// Volume Control
// ==========================
volumeSlider.addEventListener("input", e=>{ audio.volume=e.target.value; });

// ==========================
// Render Playlist
// ==========================
function renderPlaylist() {
  playlistEl.innerHTML = "";
  songs.forEach((song, index) => {
    const li = document.createElement("li");

    const coverImg = document.createElement("img");
    coverImg.src = song.cover || 'images/placeholder.png';
    li.appendChild(coverImg);

    const details = document.createElement("div");
    details.classList.add("song-details");

    const title = document.createElement("span");
    title.classList.add("title");
    title.textContent = song.title;

    const artist = document.createElement("span");
    artist.classList.add("artist");
    artist.textContent = song.artist;

    details.appendChild(title);
    details.appendChild(artist);
    li.appendChild(details);

    li.addEventListener("click", () => {
      songIndex = index;
      loadSong(songs[songIndex]);
      playSong();
    });

    playlistEl.appendChild(li);
  });
}


// ==========================
// File Upload Handling
// ==========================
fileInput.addEventListener("change", function(e){
  const files = Array.from(e.target.files);
  files.forEach(file => {
    const fileURL = URL.createObjectURL(file);
    jsmediatags.read(file, {
      onSuccess: function(tag) {
        let picture = null;
        if(tag.tags.picture){
          let base64String = "";
          const bytes = tag.tags.picture.data;
          const format = tag.tags.picture.format;
          for(let i=0;i<bytes.length;i++){
            base64String += String.fromCharCode(bytes[i]);
          }
          picture = `data:${format};base64,${btoa(base64String)}`;
        }
        const song = {
          title: tag.tags.title || file.name,
          artist: tag.tags.artist || "Unknown Artist",
          cover: picture || 'images/placeholder.png',
          fileURL: fileURL
        };
        songs.push(song);
        renderPlaylist();
        if(songs.length===1) loadSong(songs[0]);
      },
      onError: function(){
        const song = {
          title: file.name,
          artist: "Unknown Artist",
          cover: 'images/placeholder.png',
          fileURL: fileURL
        };
        songs.push(song);
        renderPlaylist();
        if(songs.length===1) loadSong(songs[0]);
      }
    });
  });
});

// ==========================
// Event Listeners
// ==========================
playBtn.addEventListener("click", ()=>{ isPlaying?pauseSong():playSong(); });
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);
audio.addEventListener("timeupdate", updateProgress);
progressContainer.addEventListener("click", setProgress);
audio.addEventListener("ended", nextSong);

