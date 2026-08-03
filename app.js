/* ==========================================================
    sedentary.
    app.js
    Parte 1/5
========================================================== */


/* ==========================================================
    COSTANTI
========================================================== */

const STATES = {
    READY_SIT: "ready_sit",
    RUNNING_SIT: "running_sit",
    READY_WALK: "ready_walk",
    RUNNING_WALK: "running_walk"
};

const SIT_SECONDS = 30 * 60;
const WALK_SECONDS = 10 * 60;

const STORAGE_KEY = "sedentary-app";


/* ==========================================================
    ELEMENTI HTML
========================================================== */

const leftTimer = document.getElementById("leftTimer");
const rightTimer = document.getElementById("rightTimer");
const mainButton = document.getElementById("mainButton");


/* ==========================================================
    STATO APPLICAZZIONE
========================================================== */

let state = STATES.READY_SIT;

let endTime = null;

let interval = null;


/* ==========================================================
    FORMATTA TEMPO
========================================================== */

function formatTime(seconds) {

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
        String(mins).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );

}


/* ==========================================================
    TEMPO RIMANENTE
========================================================== */

function getRemainingSeconds() {

    if (!endTime) return 0;

    return Math.max(
        0,
        Math.ceil(
            (endTime - Date.now()) / 1000
        )
    );

}


/* ==========================================================
    SALVATAGGIO
========================================================== */

function saveState() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

            state,
            endTime

        })

    );

}


/* ==========================================================
    CARICAMENTO
========================================================== */

function loadState() {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return false;

    try {

        const data = JSON.parse(raw);

        state = data.state;
        endTime = data.endTime;

        return true;

    }

    catch {

        return false;

    }

}


/* ==========================================================
    RESET STORAGE
========================================================== */

function clearState() {

    localStorage.removeItem(STORAGE_KEY);

}


/* ==========================================================
    AGGIORNA INTERFACCIA
========================================================== */

function updateUI() {

    switch (state) {

        case STATES.READY_SIT:

            leftTimer.textContent = "30";
            rightTimer.textContent = "10";
            mainButton.textContent = "START!";

            break;


        case STATES.RUNNING_SIT:

            leftTimer.textContent =
                formatTime(getRemainingSeconds());

            rightTimer.textContent = "10";

            mainButton.textContent = "RUNNING";

            break;


        case STATES.READY_WALK:

            leftTimer.textContent = "30";
            rightTimer.textContent = "10";

            mainButton.textContent = "START!";

            break;


        case STATES.RUNNING_WALK:

            leftTimer.textContent = "30";

            rightTimer.textContent =
                formatTime(getRemainingSeconds());

            mainButton.textContent = "RUNNING";

            break;

    }

}
/* ==========================================================
    app.js
    Parte 2/5
========================================================== */


/* ==========================================================
    NOTIFICHE
========================================================== */

async function requestNotificationPermission() {

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission === "default") {

        await Notification.requestPermission();

    }

}


function showNotification(title, body) {

    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") return;

    new Notification(title, {

        body,

        icon: "icons/icon-192.png",

        badge: "icons/icon-192.png"

    });

}


/* ==========================================================
    AVVIA TIMER
========================================================== */

function startTimer(seconds) {

    clearInterval(interval);

    endTime = Date.now() + (seconds * 1000);

    saveState();

    updateUI();

    interval = setInterval(tick, 1000);

}


/* ==========================================================
    AGGIORNA TIMER
========================================================== */

function tick() {

    updateUI();

    if (getRemainingSeconds() > 0) {
        return;
    }

    clearInterval(interval);

    interval = null;

    switch (state) {

        case STATES.RUNNING_SIT:

            state = STATES.READY_WALK;

            endTime = null;

            saveState();

            updateUI();

            showNotification(

                "🚶 Time to walk!",

                "Premi START per iniziare i 10 minuti."

            );

            break;



        case STATES.RUNNING_WALK:

            showNotification(

                "🎉 Sessione completata!",

                "Ottimo lavoro!"

            );

            state = STATES.READY_SIT;

            endTime = null;

            clearState();

            updateUI();

            break;

    }

}


/* ==========================================================
    RIPRISTINA TIMER
========================================================== */

function restoreRunningTimer() {

    if (

        state !== STATES.RUNNING_SIT &&

        state !== STATES.RUNNING_WALK

    ) {

        updateUI();

        return;

    }

    if (getRemainingSeconds() <= 0) {

        tick();

        return;

    }

    updateUI();

    interval = setInterval(

        tick,

        1000

    );

}
