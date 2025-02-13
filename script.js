document.addEventListener('DOMContentLoaded', function() {
    const dailyMessageElement = document.getElementById('dailyMessage');
    const momentButton = document.getElementById('momentButton');

    const messagesLocalStorageKey = 'dailySunshineMessage'; // Simplified key
    const messageDateStorageKey = 'dailySunshineMessageDate'; // Key for date

    // Function to get current date in UCT+2 timezone (YYYY-MM-DD format)
    function getUCT2DateString() {
        const nowUtc = new Date();
        const uct2Offset = 2 * 60 * 60 * 1000;
        const uct2Date = new Date(nowUtc.getTime() + uct2Offset);
        const year = uct2Date.getFullYear();
        const month = String(uct2Date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(uct2Date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Function to set and display the daily message
    function setDailyMessage(messages) {
        let storedMessage = localStorage.getItem(messagesLocalStorageKey);
        let storedMessageDate = localStorage.getItem(messageDateStorageKey);
        const todayDateUCT2 = getUCT2DateString();
        const currentHourUCT2 = new Date(Date.now() + (2 * 60 * 60 * 1000)).getUTCHours(); //Get current hour in UCT+2


        if (storedMessageDate !== todayDateUCT2) {
            // It's a new day (or date in localStorage is different), reset message if it's 8 AM or later
            if (currentHourUCT2 >= 8) {
                const randomIndex = Math.floor(Math.random() * messages.length);
                storedMessage = messages[randomIndex];
                localStorage.setItem(messagesLocalStorageKey, storedMessage);
                localStorage.setItem(messageDateStorageKey, todayDateUCT2); // Store today's date
            } else if (!storedMessage) {
                // If before 8 AM and no stored message (first visit of the day before 8 AM), set initial message
                 const randomIndex = Math.floor(Math.random() * messages.length);
                storedMessage = messages[randomIndex];
                localStorage.setItem(messagesLocalStorageKey, storedMessage);
                localStorage.setItem(messageDateStorageKey, todayDateUCT2); // Store today's date
            }
        }


        dailyMessageElement.textContent = storedMessage; // Display stored message (or newly set one)
    }


    // Fetch messages and then set everything up
    fetch('messages.json')
        .then(response => response.json())
        .then(messages => {
            setDailyMessage(messages); // Set initial daily message on page load

            momentButton.addEventListener('click', () => { // Button now just gets a new random message
                const randomIndex = Math.floor(Math.random() * messages.length);
                const newMessage = messages[randomIndex];
                dailyMessageElement.textContent = newMessage;
                localStorage.setItem(messagesLocalStorageKey, newMessage); // Update stored message immediately
                localStorage.setItem(messageDateStorageKey, getUCT2DateString()); //Also update date to today when button is clicked, so next load before 8am will not change it again
            });
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
            dailyMessageElement.textContent = "Failed to load daily message.";
        });
});
