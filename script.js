document.addEventListener('DOMContentLoaded', function() {
    const dailyMessageElement = document.getElementById('dailyMessage');
    const countdownTimerElement = document.getElementById('countdownTimer');
    const momentButton = document.getElementById('momentButton');

    // Fetch messages from messages.json
    fetch('messages.json')
        .then(response => response.json()) // Parse the JSON response
        .then(messages => {
            // messages is now an array of messages from messages.json
            function setDailyMessage() {
                const randomIndex = Math.floor(Math.random() * messages.length);
                dailyMessageElement.textContent = messages[randomIndex];
            }

            setDailyMessage(); // Set initial message

            momentButton.addEventListener('click', setDailyMessage); // New message on button click
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
            dailyMessageElement.textContent = "Failed to load daily message."; // Fallback message
        });


    function updateCountdown() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Set to next midnight
        let timeLeft = midnight.getTime() - now.getTime();

        if (timeLeft < 0) {
            timeLeft = 0; // Prevent negative time if past midnight (though update should happen before)
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownTimerElement.textContent = `Time until next sunshine: ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown(); // Initial countdown update
    setInterval(updateCountdown, 1000); // Update every second
});