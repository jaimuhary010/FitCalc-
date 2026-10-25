/* =====================================
   FITCALC - JAVASCRIPT
===================================== */

document.addEventListener("DOMContentLoaded", function () {

  // ELEMENTS
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  const dropdownToggle =
    document.getElementById("dropdownToggle");

  const dropdownMenu =
    document.getElementById("dropdownMenu");

  const calculator =
    document.getElementById("bmrCalculator");

  const formError = document.getElementById("formError");

  const results = document.getElementById("results");

  const bmrResult = document.getElementById("bmrResult");

  const tdeeResult = document.getElementById("tdeeResult");

  const activityResult =
    document.getElementById("activityResult");

  const resetButton =
    document.getElementById("resetCalculator");


  /* =====================================
     MOBILE NAVIGATION
  ===================================== */

  menuToggle.addEventListener("click", function () {

    const isOpen = navMenu.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", isOpen);

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" :
        "Open navigation menu"
    );

    menuToggle.textContent = isOpen ? "✕" : "☰";

    if (!isOpen) {
      dropdownMenu.classList.remove("open");

      dropdownToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  });


  /* =====================================
     CALCULATORS DROPDOWN
  ===================================== */

  dropdownToggle.addEventListener("click", function () {

    const isOpen = dropdownMenu.classList.toggle("open");

    dropdownToggle.setAttribute(
      "aria-expanded",
      isOpen
    );
  });


  /* =====================================
     NAVIGATION LINK BEHAVIOUR
  ===================================== */

  document.querySelectorAll(".nav-menu a").forEach(
    function (link) {

      link.addEventListener("click", function () {

        navMenu.classList.remove("open");

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        menuToggle.setAttribute(
          "aria-label",
          "Open navigation menu"
        );

        menuToggle.textContent = "☰";

        dropdownMenu.classList.remove("open");

        dropdownToggle.setAttribute(
          "aria-expanded",
          "false"
        );
      });
    }
  );


  /* =====================================
     GENDER SELECTION STYLING
  ===================================== */

  document.querySelectorAll(
    'input[name="gender"]'
  ).forEach(function (radio) {

    radio.addEventListener("change", function () {

      document.querySelectorAll(
        ".gender-option"
      ).forEach(function (option) {

        option.classList.remove("selected");

      });

      radio.closest(".gender-option")
        .classList.add("selected");

    });
  });


  /* =====================================
     FORM VALIDATION
  ===================================== */

  function showError(message) {

    formError.textContent = message;

    formError.hidden = false;

    results.hidden = true;
  }


  function clearError() {

    formError.textContent = "";

    formError.hidden = true;
  }


  /* =====================================
     BMR CALCULATOR
     MIFFLIN-ST JEOR EQUATION
  ===================================== */

  calculator.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      clearError();

      // GET INPUT VALUES

      const age = Number(
        document.getElementById("age").value
      );

      const weight = Number(
        document.getElementById("weight").value
      );

      const height = Number(
        document.getElementById("height").value
      );

      const activitySelect =
        document.getElementById("activity");

      const activity = Number(activitySelect.value);

      const activityName =
        activitySelect.options[
          activitySelect.selectedIndex
        ].text;

      const genderInput =
        document.querySelector(
          'input[name="gender"]:checked'
        );

      // VALIDATE REQUIRED FIELDS

      if (
        document.getElementById("age").value.trim() === "" ||
        document.getElementById("weight").value.trim() === "" ||
        document.getElementById("height").value.trim() === ""
      ) {

        showError(
          "Please enter your age, weight and height."
        );

        return;
      }

      if (!genderInput) {

        showError(
          "Please select your gender to continue."
        );

        return;
      }

      // VALIDATE AGE

      if (
        !Number.isFinite(age) ||
        age < 18 ||
        age > 120
      ) {

        showError(
          "Please enter an age between 18 and 120 years."
        );

        return;
      }

      // VALIDATE WEIGHT

      if (
        !Number.isFinite(weight) ||
        weight < 20 ||
        weight > 500
      ) {

        showError(
          "Please enter a valid weight between 20 and 500 kg."
        );

        return;
      }

      // VALIDATE HEIGHT

      if (
        !Number.isFinite(height) ||
        height < 100 ||
        height > 250
      ) {

        showError(
          "Please enter a valid height between 100 and 250 cm."
        );

        return;
      }

      // VALIDATE ACTIVITY LEVEL

      const validActivities = [
        1.2,
        1.375,
        1.55,
        1.725,
        1.9
      ];

      if (!validActivities.includes(activity)) {

        showError(
          "Please select a valid activity level."
        );

        return;
      }


      /* =====================================
         CALCULATE BMR
      ===================================== */

      let bmr;

      if (genderInput.value === "male") {

        bmr =
          (10 * weight) +
          (6.25 * height) -
          (5 * age) +
          5;

      } else {

        bmr =
          (10 * weight) +
          (6.25 * height) -
          (5 * age) -
          161;

      }


      /* =====================================
         CALCULATE TDEE
      ===================================== */

      const tdee = bmr * activity;

      // DISPLAY RESULTS

      bmrResult.textContent =
        Math.round(bmr).toLocaleString("en-US");

      tdeeResult.textContent =
        Math.round(tdee).toLocaleString("en-US");

      activityResult.textContent =
        "Selected activity: " + activityName;

      results.hidden = false;

      // SCROLL TO RESULTS

      results.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }
  );


  /* =====================================
     CALCULATE AGAIN / RESET
  ===================================== */

  resetButton.addEventListener("click", function () {

    calculator.reset();

    clearError();

    results.hidden = true;

    // Restore default gender styling

    document.querySelectorAll(
      ".gender-option"
    ).forEach(function (option) {

      option.classList.remove("selected");

    });

    const defaultGender = document.querySelector(
      'input[name="gender"][value="male"]'
    );

    defaultGender.checked = true;

    defaultGender.closest(
      ".gender-option"
    ).classList.add("selected");

    document.getElementById("age").focus();

  });


  /* =====================================
     FAQ ACCORDION
  ===================================== */

  document.querySelectorAll(
    ".faq-question"
  ).forEach(function (button) {

    button.addEventListener("click", function () {

      const answer = button.nextElementSibling;

      const icon = button.querySelector(".faq-icon");

      const isExpanded =
        button.getAttribute("aria-expanded") === "true";

      // Toggle current question

      button.setAttribute(
        "aria-expanded",
        String(!isExpanded)
      );

      answer.hidden = isExpanded;

      icon.textContent = isExpanded ? "+" : "−";

    });

  });


  /* =====================================
     DYNAMIC COPYRIGHT YEAR
  ===================================== */

  document.getElementById(
    "currentYear"
  ).textContent = new Date().getFullYear();


  /* =====================================
     CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  ===================================== */

  document.addEventListener("click", function (event) {

    if (
      !event.target.closest(".dropdown") &&
      !event.target.closest(".menu-toggle")
    ) {

      dropdownMenu.classList.remove("open");

      dropdownToggle.setAttribute(
        "aria-expanded",
        "false"
      );

    }

  });


  /* =====================================
     CLOSE MOBILE MENU ON DESKTOP RESIZE
  ===================================== */

  window.addEventListener("resize", function () {

    if (window.innerWidth > 700) {

      navMenu.classList.remove("open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );

      menuToggle.textContent = "☰";

    }

  });

});