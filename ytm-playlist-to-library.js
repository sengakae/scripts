/* Script to add all songs in a playlist to user's library
 * 1. Open the target playlist
 * 2. Open the developer console
 * 3. Copy the code below and paste it into the console
 */

var playlist = document.body.querySelector(".style-scope.ytmusic-section-list-renderer.fullbleed");
var song = playlist.querySelectorAll(".dropdown-trigger.style-scope.ytmusic-menu-renderer");

for (var i = 0; i < song.length; i++) {
  song[i].click();
  var dropdown = document.body.querySelector("ytmusic-menu-popup-renderer[slot='dropdown-content']");

  if (dropdown != undefined) {
    var addSong = dropdown.querySelector("tp-yt-paper-listbox#items").querySelector("ytmusic-toggle-menu-service-item-renderer.style-scope.ytmusic-menu-popup-renderer");

    if (addSong != null) {
      actualAddSong = addSong.querySelector('yt-formatted-string.text.style-scope.ytmusic-toggle-menu-service-item-renderer');

      if (actualAddSong != null) {
        if (actualAddSong.innerHTML == 'Save to library') {
          addSong.click();
          console.log("Saved to library");
          await new Promise(r => setTimeout(r, 200));
        }
      }
    }
  }

  await new Promise(r => setTimeout(r, 100));
}

console.log("All songs in playlist added to library.")