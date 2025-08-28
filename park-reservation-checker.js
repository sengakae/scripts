// ==UserScript==
// @name         Pass Availability Checker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Polls Day Pass API for pass availability
// @match        https://reserve.bcparks.ca/dayuse/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Update this for your target park API
  const API_URL =
    "https://d757dzcblh.execute-api.ca-central-1.amazonaws.com/api/reservation?facility=Joffre%20Lakes&park=0363";

  // Which date(s) to check
  const TARGET_DATES = ["2025-08-30"];

  // Telegram credentials to sent notification
  const TELEGRAM_BOT_TOKEN = "";
  const TELEGRAM_CHAT_ID = "";

  const POLL_INTERVAL = 3000;

  const alarm = new Audio(
    "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
  );

  function sendTelegramMessage(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log("Telegram credentials not set. Skipping message.");
      return;
    }
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;
    fetch(url)
      .then(() => console.log("Telegram message sent:", message))
      .catch((err) => console.warn("Telegram message failed:", err));
  }

  function notify(message) {
    if (Notification.permission === "granted") {
      new Notification(message);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(message);
        }
      });
    }
    console.log("Notification:", message);
  }

  async function checkAvailability() {
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      const data = await res.json();

      let found = false;
      for (const date of TARGET_DATES) {
        const info = data[date]?.DAY;
        if (info && info.capacity && info.capacity.toLowerCase() !== "full") {
          const message = `Passes available on ${date}: ${info.capacity}`;
          alarm.play().catch((err) =>
            console.warn("Unable to autoplay sound:", err)
          );

          sendTelegramMessage(message);

          notify(message);
          alert(message);
          console.log(message);
          found = true;
        } else {
          console.log(`No passes on ${date} (status: ${info?.capacity || "-"})`);
        }
      }

      if (!found) {
        setTimeout(checkAvailability, POLL_INTERVAL);
      } else {
        console.log("Found passes, stopped polling.");
        return;
      }
    } catch (err) {
      console.error("Error checking availability:", err);
      setTimeout(checkAvailability, POLL_INTERVAL);
    }
  }

  checkAvailability();
})();
