// ==UserScript==
// @name         Park Reservation Page Autofill
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically fills out the reservation page flow when loaded onto the page.
// @match        https://reserve.bcparks.ca/dayuse/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Constants to set for target park reservation
  const TARGET_DATE_LABEL = "Sunday, August 31, 2025";
  const TARGET_PASS_TEXT = "Joffre Lakes - Trail";

  const triggerEvent = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));

  const triggerClick = (el) => {
    ["touchstart", "touchend", "click"].forEach(evt => triggerEvent(el, evt));
  };

  async function waitForSelector(selector, timeout = 10000) {
    const interval = 200;
    let waited = 0;
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          resolve(el);
        }
        waited += interval;
        if (waited >= timeout) {
          clearInterval(timer);
          reject(new Error("Timeout waiting for " + selector));
        }
      }, interval);
    });
  }

  async function selectDate() {
    const dateBtn = await waitForSelector(".date-input__calendar-btn");
    triggerClick(dateBtn);

    const targetCell = await waitForSelector(`div[aria-label="${TARGET_DATE_LABEL}"]`);
    triggerClick(targetCell);
    console.log("Date selected:", TARGET_DATE_LABEL);
  }

  async function selectPassType() {
    const selectEl = await waitForSelector("#passType");
    const option = Array.from(selectEl.options).find(opt =>
      opt.textContent.trim().toLowerCase().includes(TARGET_PASS_TEXT.toLowerCase())
    );
    if (!option) throw new Error("Target pass type not found");
    selectEl.value = option.value;
    triggerEvent(selectEl, "change");
    console.log("Pass type selected:", option.textContent.trim());
  }

  async function selectVisitTime() {
    await waitForSelector('input[type="radio"][name="visitTime"]');
    const radioInputs = Array.from(document.querySelectorAll('input[type="radio"][name="visitTime"]'));
    const firstAvailable = radioInputs.find(i => !i.disabled);
    if (!firstAvailable) throw new Error("No available visit times found");
    firstAvailable.checked = true;
    triggerEvent(firstAvailable, "change");
    triggerClick(firstAvailable);
    console.log("Visit time selected:", firstAvailable.value);
  }

  async function selectPassCountAndNext() {
    const passCountSelect = await waitForSelector('#passCount');
      const options = Array.from(passCountSelect.options).filter(opt => !opt.disabled);
      if (options.length === 0) throw new Error("No valid pass count options");
      const lastOption = options[options.length - 1];
      passCountSelect.value = lastOption.value;
      triggerEvent(passCountSelect, "change");
      console.log("Pass count selected:", lastOption.textContent.trim());

      await waitForSelector("button.btn-primary");
      const nextButton = Array.from(document.querySelectorAll("button.btn-primary"))
          .find(btn => btn.textContent.trim().toLowerCase().includes("next"));
      if (!nextButton) throw new Error("Next button not found");
      triggerClick(nextButton);
      console.log("Clicked Next button");
  }

  async function autoFillReservation() {
    try {
      console.log("Starting Park Reservation Autofill");
      await selectDate();
      await selectPassType();
      await selectVisitTime();
      await selectPassCountAndNext();
      console.log("Autofill completed");
    } catch (err) {
      console.error("Autofill error:", err);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    autoFillReservation();
  } else {
    window.addEventListener("DOMContentLoaded", autoFillReservation);
  }

})();