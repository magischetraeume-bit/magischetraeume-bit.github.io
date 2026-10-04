(function () {
  const translations = window.translations || {};
  const languageSelect = document.getElementById("languageSelect");

  const firebaseConfig = {
    apiKey: "AIzaSyDHJq9v38Kkkd8s1KqRqpq-HO3iZAFYB2s",
    authDomain: "imre-creative-studio-web.firebaseapp.com",
    projectId: "imre-creative-studio-web",
    storageBucket: "imre-creative-studio-web.firebasestorage.app",
    messagingSenderId: "171983833815",
    appId: "1:171983833815:web:962a36f752de101bedbe92",
    measurementId: "G-5SSTF0Q5GN"
  };

  let analytics = null;
  let logEventFn = null;
  let analyticsStarted = false;

  const appNamesByPage = {
    "carpnavx.html": "CarpNavX",
    "ai-lotto.html": "AI Lotto",
    "catch-master.html": "Catch Master",
    "cyberpunk-wallpaper.html": "AI Live & 4K Wallpapers",
    "xenoria.html": "Xenoria"
  };

  const appNamesByPlayUrl = {
    "com.imre.carpnavx": "CarpNavX",
    "com.imre.lottorandomgenerator": "AI Lotto",
    "com.imre.catchmastertracker": "Catch Master",
    "com.imre.cryptowallpapers": "AI Live & 4K Wallpapers"
  };

  function currentLanguage() {
    return (
      localStorage.getItem("imreCreativeStudioLanguage") ||
      (navigator.language || "en").toLowerCase().substring(0, 2) ||
      "en"
    );
  }

  function applyLanguage(language) {
    if (!translations[language]) {
      language = "en";
    }

    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");

      if (
        translations[language] &&
        translations[language][key] !== undefined
      ) {
        element.textContent = translations[language][key];
      }
    });

    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      const key = element.getAttribute("data-i18n-html");

      if (
        translations[language] &&
        translations[language][key] !== undefined
      ) {
        element.innerHTML = translations[language][key];
      }
    });

    if (languageSelect) {
      languageSelect.value = language;
    }

    localStorage.setItem(
      "imreCreativeStudioLanguage",
      language
    );

    updateConsentTexts(language);
  }

  function getInitialLanguage() {
    const savedLanguage = localStorage.getItem(
      "imreCreativeStudioLanguage"
    );

    if (
      savedLanguage &&
      translations[savedLanguage]
    ) {
      return savedLanguage;
    }

    const browserLanguage = (
      navigator.language || "en"
    )
      .toLowerCase()
      .substring(0, 2);

    if (translations[browserLanguage]) {
      return browserLanguage;
    }

    return "en";
  }

  function getCurrentAppName() {
    const fileName = window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();

    return appNamesByPage[fileName] || null;
  }

  function getAppNameFromPlayUrl(url) {
    for (const packageName in appNamesByPlayUrl) {
      if (url.includes(packageName)) {
        return appNamesByPlayUrl[packageName];
      }
    }

    return null;
  }

  async function startAnalytics() {
    if (analyticsStarted) {
      return;
    }

    analyticsStarted = true;

    try {
      const [
        firebaseAppModule,
        firebaseAnalyticsModule
      ] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js")
      ]);

      const app = firebaseAppModule.initializeApp(
        firebaseConfig
      );

      analytics =
        firebaseAnalyticsModule.getAnalytics(app);

      logEventFn =
        firebaseAnalyticsModule.logEvent;

      const appName = getCurrentAppName();

      if (appName) {
        logEventFn(
          analytics,
          "app_detail_open",
          {
            app_name: appName,
            language: currentLanguage()
          }
        );
      }
    } catch (error) {
      console.error(
        "Firebase Analytics initialization failed:",
        error
      );
    }
  }

  function logAnalyticsEvent(
    eventName,
    parameters = {}
  ) {
    if (!analytics || !logEventFn) {
      return;
    }

    logEventFn(
      analytics,
      eventName,
      parameters
    );
  }

  function consentTexts(language) {
    const texts = {
      en: {
        message:
          "We use Firebase / Google Analytics to measure visits and understand how the website is used. You can allow or decline analytics.",
        allow: "Allow analytics",
        decline: "Decline",
        settings: "Analytics settings"
      },
      hu: {
        message:
          "Firebase / Google Analytics segítségével szeretnénk mérni a látogatottságot és azt, hogyan használják a weboldalt. Az analitikai mérést engedélyezheted vagy elutasíthatod.",
        allow: "Engedélyezem",
        decline: "Elutasítom",
        settings: "Analitikai beállítások"
      },
      de: {
        message:
          "Wir verwenden Firebase / Google Analytics, um Besuche zu messen und zu verstehen, wie die Website genutzt wird. Du kannst die Analyse erlauben oder ablehnen.",
        allow: "Analytics erlauben",
        decline: "Ablehnen",
        settings: "Analytics-Einstellungen"
      },
      fr: {
        message:
          "Nous utilisons Firebase / Google Analytics pour mesurer les visites et comprendre l’utilisation du site. Vous pouvez accepter ou refuser les mesures analytiques.",
        allow: "Autoriser",
        decline: "Refuser",
        settings: "Paramètres Analytics"
      }
    };

    return texts[language] || texts.en;
  }

  function injectConsentStyles() {
    if (
      document.getElementById(
        "analyticsConsentStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "analyticsConsentStyles";

    style.textContent = `
      .analytics-consent {
        position: fixed;
        left: 18px;
        right: 18px;
        bottom: 18px;
        z-index: 9999;
        max-width: 920px;
        margin: 0 auto;
        padding: 18px 20px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,.14);
        background: rgba(11,16,29,.97);
        box-shadow: 0 18px 55px rgba(0,0,0,.45);
        color: #dce6f8;
        backdrop-filter: blur(14px);
      }

      .analytics-consent p {
        margin: 0 0 14px;
        color: #b9c4d9;
        font-size: 14px;
        line-height: 1.55;
      }

      .analytics-consent-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .analytics-consent button {
        min-height: 42px;
        padding: 0 16px;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
      }

      .analytics-consent-allow {
        border: 0;
        color: white;
        background: linear-gradient(
          135deg,
          #5d7cff,
          #49b9ff
        );
      }

      .analytics-consent-decline {
        border: 1px solid rgba(255,255,255,.16);
        color: #dce6f8;
        background: rgba(255,255,255,.05);
      }

      .analytics-settings-button {
        display: inline-block;
        margin-top: 12px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #7faeff;
        font-size: 12px;
        cursor: pointer;
      }

      @media (max-width: 600px) {
        .analytics-consent {
          left: 10px;
          right: 10px;
          bottom: 10px;
          padding: 16px;
        }

        .analytics-consent-actions {
          flex-direction: column;
        }

        .analytics-consent button {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function updateConsentTexts(language) {
    const banner =
      document.getElementById(
        "analyticsConsentBanner"
      );

    const settingsButton =
      document.getElementById(
        "analyticsSettingsButton"
      );

    const text =
      consentTexts(language);

    if (banner) {
      const message =
        banner.querySelector(
          "[data-consent-message]"
        );

      const allow =
        banner.querySelector(
          "[data-consent-allow]"
        );

      const decline =
        banner.querySelector(
          "[data-consent-decline]"
        );

      if (message) {
        message.textContent =
          text.message;
      }

      if (allow) {
        allow.textContent =
          text.allow;
      }

      if (decline) {
        decline.textContent =
          text.decline;
      }
    }

    if (settingsButton) {
      settingsButton.textContent =
        text.settings;
    }
  }

  function hideConsentBanner() {
    const banner =
      document.getElementById(
        "analyticsConsentBanner"
      );

    if (banner) {
      banner.remove();
    }
  }

  function showConsentBanner() {
    injectConsentStyles();

    hideConsentBanner();

    const banner =
      document.createElement("div");

    banner.id =
      "analyticsConsentBanner";

    banner.className =
      "analytics-consent";

    banner.innerHTML = `
      <p data-consent-message></p>

      <div class="analytics-consent-actions">
        <button
          type="button"
          class="analytics-consent-allow"
          data-consent-allow>
        </button>

        <button
          type="button"
          class="analytics-consent-decline"
          data-consent-decline>
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    updateConsentTexts(
      currentLanguage()
    );

    banner
      .querySelector(
        "[data-consent-allow]"
      )
      .addEventListener(
        "click",
        async () => {
          localStorage.setItem(
            "analyticsConsent",
            "granted"
          );

          hideConsentBanner();

          await startAnalytics();
        }
      );

    banner
      .querySelector(
        "[data-consent-decline]"
      )
      .addEventListener(
        "click",
        () => {
          localStorage.setItem(
            "analyticsConsent",
            "denied"
          );

          hideConsentBanner();
        }
      );
  }

  function addAnalyticsSettingsButton() {
    injectConsentStyles();

    const footer =
      document.querySelector("footer");

    if (
      !footer ||
      document.getElementById(
        "analyticsSettingsButton"
      )
    ) {
      return;
    }

    const button =
      document.createElement("button");

    button.id =
      "analyticsSettingsButton";

    button.type =
      "button";

    button.className =
      "analytics-settings-button";

    button.addEventListener(
      "click",
      () => {
        localStorage.removeItem(
          "analyticsConsent"
        );

        showConsentBanner();
      }
    );

    const container =
      footer.querySelector(
        ".container"
      ) || footer;

    container.appendChild(
      document.createElement("br")
    );

    container.appendChild(button);

    updateConsentTexts(
      currentLanguage()
    );
  }

  if (languageSelect) {
    languageSelect.addEventListener(
      "change",
      function () {
        applyLanguage(this.value);

        logAnalyticsEvent(
          "language_change",
          {
            language: this.value
          }
        );
      }
    );
  }

  document
    .querySelectorAll("[data-page]")
    .forEach((card) => {
      const openCard = () => {
        const href =
          card.getAttribute(
            "data-page"
          );

        if (href) {
          window.location.href =
            href;
        }
      };

      card.addEventListener(
        "click",
        (event) => {
          if (
            event.target.closest(
              "a, button, select"
            )
          ) {
            return;
          }

          openCard();
        }
      );

      card.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();

            openCard();
          }
        }
      );
    });

  document
    .querySelectorAll(
      'a[href*="play.google.com"]'
    )
    .forEach((link) => {
      link.addEventListener(
        "click",
        () => {
          const appName =
            getAppNameFromPlayUrl(
              link.href
            ) ||
            getCurrentAppName() ||
            "Unknown";

          logAnalyticsEvent(
            "google_play_click",
            {
              app_name: appName,
              language:
                currentLanguage()
            }
          );
        }
      );
    });

  document
    .querySelectorAll(
      'a[href^="mailto:"]'
    )
    .forEach((link) => {
      link.addEventListener(
        "click",
        () => {
          logAnalyticsEvent(
            "contact_click",
            {
              page:
                getCurrentAppName() ||
                "Home",
              language:
                currentLanguage()
            }
          );
        }
      );
    });

  applyLanguage(
    getInitialLanguage()
  );

  addAnalyticsSettingsButton();

  const savedConsent =
    localStorage.getItem(
      "analyticsConsent"
    );

  if (savedConsent === "granted") {
    startAnalytics();
  } else if (
    savedConsent !== "denied"
  ) {
    showConsentBanner();
  }
})();