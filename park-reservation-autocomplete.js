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

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  function triggerEvent(el, type) {
    const event = new Event(type, { bubbles: true, cancelable: true });
    el.dispatchEvent(event);
  }


  function triggerTouchClick(el) {
    triggerEvent(el, "touchstart");
    triggerEvent(el, "touchend");
    triggerEvent(el, "click");
  }

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
      triggerTouchClick(dateBtn);
      console.log("Clicked date button");

      const targetCell = document.querySelector(
        `div[role="gridcell"][aria-label="${TARGET_DATE_LABEL}"] div[ngbdatepickerdayview]`
      );
      if (targetCell) {
        triggerTouchClick(targetCell);
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
        await delay(200);
      } else {
        console.warn("Target pass type not found");
      }

      await waitForSelector('input[type="radio"][name="visitTime"]');
        
      const visitTimeInputs = document.querySelectorAll(
        'input[type="radio"][name="visitTime"]'
      );
      const firstAvailable = [...visitTimeInputs].find((input) => !input.disabled);

      if (firstAvailable) {
        firstAvailable.checked = true;
        firstAvailable.dispatchEvent(new Event("input", { bubbles: true }));
        firstAvailable.dispatchEvent(new Event("change", { bubbles: true }));
        triggerTouchClick(firstAvailable);
        console.log("Visit time selected:", firstAvailable.value);
      } else {
        console.warn("No available visit times found");
      }

      const passCountSelect = await waitForSelector('#passCount');
      const options = Array.from(passCountSelect.querySelectorAll('option'));

      const lastEnabledOption = [...options].reverse().find(opt => !opt.disabled);

      if (lastEnabledOption) {
        passCountSelect.value = lastEnabledOption.value;

        passCountSelect.dispatchEvent(new Event("input", { bubbles: true }));
        passCountSelect.dispatchEvent(new Event("change", { bubbles: true }));

        console.log("Selected last pass count:", lastEnabledOption.textContent.trim());

        const nextButton = [...document.querySelectorAll("button.btn-primary")]
          .find((btn) => btn.textContent.trim().toLowerCase() === "next");

        if (nextButton) {
          triggerTouchClick(nextButton);
          console.log("Clicked Next button");
        } else {
          console.warn("Next button not found");
        }
      } else {
        console.warn("No valid option found in passCount dropdown");
      }
    } catch (err) {
      console.error("Script error:", err);
    }
  }

  window.addEventListener("load", selectDateAndPass);
})();
