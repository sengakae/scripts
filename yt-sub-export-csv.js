/* Script to export all subscriptions from a Youtube channel
 * 1. Open the subscriptions page https://www.youtube.com/feed/channels
 * 2. Open the developer console
 * 3. Copy the code below and paste it into the console
 */

var subscriptions = document.body.querySelector('.style-scope.ytd-expanded-shelf-contents-renderer');

var csvRows = [["Channel Name", "Link"]];

for (var i = 0; i < subscriptions.children.length; i++) {
    var channelInfo = subscriptions.children[i].querySelector('#info-section');

    if (channelInfo) {
        var link = channelInfo.querySelector('a#main-link');
        if (link) {
            var href = link.getAttribute('href'); 

            var channelNameEl = link.querySelector('#text');
            var channelName = channelNameEl ? channelNameEl.textContent.trim() : null;
            csvRows.push([channelName, href]);
        } else {
            console.log('Anchor tag not found.');
        }
    }
}

var csvContent = csvRows.map(row => row.map(value => `"${value}"`).join(",")).join("\n");

// To show non-ASCII chars
var utf8Bom = "\uFEFF";
var blob = new Blob([utf8Bom + csvContent], { type: 'text/csv;charset=utf-8;' });

var downloadLink = document.createElement('a');
var url = URL.createObjectURL(blob);
downloadLink.setAttribute('href', url);
downloadLink.setAttribute('download', 'subscriptions.csv');

document.body.appendChild(downloadLink);
downloadLink.click();
document.body.removeChild(downloadLink);
