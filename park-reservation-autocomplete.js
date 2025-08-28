// ==UserScript==
// @name         Park Reservation Page Auto Complete
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically selects a date and pass type when visiting the Joffre Lakes reservation page
// @match        https://reserve.bcparks.ca/dayuse/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Constants to set for target park reservation
  const TARGET_DATE_LABEL = "Saturday, August 30, 2025";
  const TARGET_PASS_TEXT = "Joffre Lakes - Trail";

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  function waitForSelector(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const interval = 200;
      let waited = 0;
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

  async function selectDateAndPass() {
    try {
      console.log("Starting auto-selection script");

      const dateBtn = await waitForSelector(".date-input__calendar-btn");
      dateBtn.click();
      console.log("Clicked date button");
      await delay(200);

      const targetCell = document.querySelector(
        `div[role="gridcell"][aria-label="${TARGET_DATE_LABEL}"] div[ngbdatepickerdayview]`
      );
      if (targetCell) {
        targetCell.click();
        targetCell.dispatchEvent(new Event("input", { bubbles: true }));
        targetCell.dispatchEvent(new Event("change", { bubbles: true }));
        console.log("Date selected");
        await delay(200);
      } else {
        console.warn("Target date not found");
      }

      const passTypeSelect = await waitForSelector("#passType");
      const option = [...passTypeSelect.options].find(
        (opt) => opt.textContent.trim() === TARGET_PASS_TEXT
      );
      if (option) {
        passTypeSelect.value = option.value;
        passTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));
        console.log("Pass type selected");
      } else {
        console.warn("Target pass type not found");
      }

    } catch (err) {
      console.error("Script error:", err);
    }
  }

  window.addEventListener("load", selectDateAndPass);
})();
