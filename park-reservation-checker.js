// ==UserScript==
// @name         Pass Availability Checker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Polls Day Pass API for pass availability
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Update this for your target park API
  const API_URL =
    "https://d757dzcblh.execute-api.ca-central-1.amazonaws.com/api/reservation?facility=Joffre%20Lakes&park=0363";

  // Which date(s) to check (2 days max in advance)
  const TARGET_DATES = ["2025-08-30"];

  const POLL_INTERVAL = 3000;

  async function checkAvailability() {
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      const data = await res.json();

      let found = false;
      for (const date of TARGET_DATES) {
        const info = data[date]?.DAY;
        if (info && info.capacity && info.capacity.toLowerCase() !== "full") {
          alert(`Availability on ${date}: ${info.capacity}`);
          console.log(`Availability on ${date}:`, info);
          found = true;
        } else {
          console.log(`No passes on ${date} (status: ${info?.capacity || "-"})`);
        }
      }

      if (!found) {
        setTimeout(checkAvailability, POLL_INTERVAL);
      } else {
        console.log("Found passes, stopped polling.");
      }
    } catch (err) {
      console.error("Error checking availability:", err);
      setTimeout(checkAvailability, POLL_INTERVAL); // retry
    }
  }

  checkAvailability();
})();
