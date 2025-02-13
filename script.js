document.addEventListener('DOMContentLoaded', function() {
    const dailyMessageElement = document.getElementById('dailyMessage');
    const countdownTimerElement = document.getElementById('countdownTimer');
    const momentButton = document.getElementById('momentButton');
    const lastResetInfoElement = document.getElementById('lastResetInfo'); // New element

    const messagesLocalStorageKey = 'dailySunshineMessages';
    const lastResetTimeStorageKey = 'lastSunshineResetTime';

    // Function to convert UTC time to UCT+2 timezone and format
    function formatUCT2Time(utcTimestamp) {
        const utcDate = new Date(utcTimestamp);
        const uct2Offset = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
        const uct2Date = new Date(utcDate.getTime() + uct2Offset);

        const options = {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZone: 'UTC', // Keep it UTC for formatting, display as UCT+2 textually
            timeZoneName: 'shortOffset' // e.g., 'GMT+2'
        };
        return uct2Date.toLocaleString('en-US', options).replace('GMT+2', 'UCT+2'); //replace to show UCT+2
    }


    // Function to set and display the daily message
    function setDailyMessage(messages) {
        let lastResetTime = localStorage.getItem(lastResetTimeStorageKey);
        let currentMessage = localStorage.getItem(messagesLocalStorageKey);
        let nextResetTime;

        const nowUtc = Date.now(); // Current time in UTC

        if (lastResetTime) {
            lastResetTime = parseInt(lastResetTime, 10); // Parse from string to number (timestamp)
            const timeSinceReset = nowUtc - lastResetTime;
            const twentyFourHoursMs = 24 * 60 * 60 * 1000;

            if (timeSinceReset >= twentyFourHoursMs) {
                // 24 hours or more have passed, reset message
                const randomIndex = Math.floor(Math.random() * messages.length);
                currentMessage = messages[randomIndex];
                lastResetTime = nowUtc; // Reset to current UTC time
                localStorage.setItem(messagesLocalStorageKey, currentMessage);
                localStorage.setItem(lastResetTimeStorageKey, lastResetTime.toString());
            }
             nextResetTime = lastResetTime + twentyFourHoursMs; //Calculate next reset time

        } else {
            // First visit or no reset time set yet
            const randomIndex = Math.floor(Math.random() * messages.length);
            currentMessage = messages[randomIndex];
            lastResetTime = nowUtc; // Set initial reset time to current UTC
            localStorage.setItem(messagesLocalStorageKey, currentMessage);
            localStorage.setItem(lastResetTimeStorageKey, lastResetTime.toString());
            nextResetTime = lastResetTime + (24 * 60 * 60 * 1000); // Calculate initial next reset
        }

        dailyMessageElement.textContent = currentMessage;

        const lastResetTimeUCT2Formatted = formatUCT2Time(lastResetTime);
        lastResetInfoElement.textContent = `Last message reset: ${lastResetTimeUCT2Formatted}. Current message: "${currentMessage}"`;
        // No need to return currentMessage anymore, it's set in localStorage
         return nextResetTime; // Return next reset time for countdown
    }


    function updateCountdown(nextResetTime) { // Take nextResetTime as argument
        const now = new Date();
        let timeLeft = nextResetTime - now.getTime(); // Use nextResetTime for countdown

        if (timeLeft < 0) {
            timeLeft = 0; // Prevent negative time
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownTimerElement.textContent = `Time until next sunshine: ${hours}h ${minutes}m ${seconds}s`;
    }


    // Fetch messages and then set everything up
    fetch('messages.json')
        .then(response => response.json())
        .then(messages => {
            let nextResetTime = setDailyMessage(messages); // Get next reset time after setting message
            updateCountdown(nextResetTime); // Initial countdown with correct next reset time
            momentButton.addEventListener('click', () => {
                nextResetTime = setDailyMessage(messages); // Update message and get new reset time
                updateCountdown(nextResetTime); // Update countdown immediately after button click
            });
            setInterval(() => updateCountdown(nextResetTime), 1000); // Set interval with next reset time
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
            dailyMessageElement.textContent = "Failed to load daily message.";
        });
});
