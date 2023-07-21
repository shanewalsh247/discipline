// Global variables to store timer state
let days = 0;
let hours = 0;
let minutes = 0;
let seconds = 0;
let interval; // To store timer values

// Function to update the timer display
function updateTimerDisplay() {
    const daysDisplay = document.getElementById('days');
    const hoursDisplay = document.getElementById('hours');
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');

    daysDisplay.innerText = String(days).padStart(2, '0');
    hoursDisplay.innerText = String(hours).padStart(2, '0');
    minutesDisplay.innerText = String(minutes).padStart(2, '0');
    secondsDisplay.innerText = String(seconds).padStart(2, '0');
}

// Function to start the timer
function startTimer() {
    clearInterval(interval);
    interval = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
        if (minutes === 60) {
            minutes = 0;
            hours++;
        }
        if (hours === 24) {
            hours = 0;
            days++;
        }
        updateTimerDisplay();
    }, 1000);
}

// Function to stop the timer
function stopTimer() {
    clearInterval(interval);
}

// Function to reset the timer
function resetTimer() {
    clearInterval(interval);
    days = 0;
    hours = 0;
    minutes = 0;
    seconds = 0;
    updateTimerDisplay();
}

// Function to send timer data to the serverless function
async function sendTimerData(action, timerState) {
    try {
        const response = await fetch('/.netlify/functions/timer', {
            method: 'POST',
            body: JSON.stringify({ action, ...timerState })
        });

        if (response.ok) {
            console.log(await response.json());
        } else {
            console.error('Failed to send timer data:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error sending timer data:', error);
    }
}

// Function to initialize the timer display and fetch the timer state from FaunaDB
async function initTimer() {
    try {
        const response = await fetch('/.netlify/functions/timer', {
            method: 'GET'
        });

        if (response.ok) {
            const timerState = await response.json();
            days = timerState.days || 0;
            hours = timerState.hours || 0;
            minutes = timerState.minutes || 0;
            seconds = timerState.seconds || 0;
            updateTimerDisplay();
        } else {
            console.error('Failed to fetch timer data:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error fetching timer data:', error);
    }
}

// Event listener for the "Start" button click
document.getElementById('button-start').addEventListener('click', () => {
    startTimer();
    const timerState = {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
    sendTimerData('start', timerState);
});

// Event listener for the "Stop" button click
document.getElementById('button-stop').addEventListener('click', () => {
    stopTimer();
    const timerState = {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
    sendTimerData('stop', timerState);
});

// Event listener for the "Reset" button click
document.getElementById('button-reset').addEventListener('click', () => {
    resetTimer();
    sendTimerData('reset', {});
});

// Call the initTimer function when the page loads
window.addEventListener('load', initTimer);


