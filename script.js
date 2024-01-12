        var total = 0;
        var clicks = 0;
        var cookiesPerClick = 1;
        var autoclickers = 0;
        var autoclickerRate = 2;
        var clickCooldown = false;
    
        var musicMuted = false;
        var audioMuted = false;
    
        function playBackgroundMusic() {
            var backgroundMusic = document.getElementById('backgroundMusic');
            backgroundMusic.volume = 0.5; // Adjust volume as needed
    
            // Check if the audio context requires user interaction
            var playPromise = backgroundMusic.play();
    
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // Autoplay started successfully
                }).catch(error => {
                    // Autoplay was prevented, show a UI element to let the user start playback
                    console.error("Autoplay prevented:", error);
                });
            }
    
            document.removeEventListener("click", playBackgroundMusic);
        }
    
        document.addEventListener("click", playBackgroundMusic);
    
        function toggleMusic() {
            musicMuted = !musicMuted;
            var backgroundMusic = document.getElementById("backgroundMusic");
            backgroundMusic.muted = musicMuted;
            updateSoundButtons(); // Update sound control buttons
        }
    
        function toggleAudio() {
            audioMuted = !audioMuted;
            var clickSound = document.getElementById("clickSound");
            var buySound = document.getElementById("buySound");
            clickSound.muted = audioMuted;
            buySound.muted = audioMuted;
            updateSoundButtons(); // Update sound control buttons
        }
    
        function updateSoundButtons() {
            var musicToggle = document.getElementById('musicToggle');
            var audioToggle = document.getElementById('audioToggle');
    
            if (musicMuted) {
                musicToggle.innerText = "🎵 Music 🔇";
            } else {
                musicToggle.innerText = "🎵 Music 🔊";
            }
    
            if (audioMuted) {
                audioToggle.innerText = "🔊 Audio 🔇";
            } else {
                audioToggle.innerText = "🔊 Audio 🔊";
            }
        }
    
        function updateButtonStyle() {
            var buyButtons = document.querySelectorAll(".buyButton:not(.bought)");
            buyButtons.forEach(function (button) {
                var buttonCost = parseInt(button.innerText.match(/-(\d+)/)[1]);
                if (total < buttonCost) {
                    button.classList.add("notBuyable");
                } else {
                    button.classList.remove("notBuyable");
                }
            });
        }
    
        function checkButtonBuyableStatus() {
            var buyButtons = document.querySelectorAll(".buyButton:not(.bought)");
            buyButtons.forEach(function (button) {
                var buttonCost = parseInt(button.getAttribute("data-cost"));
                if (total < buttonCost) {
                    button.classList.add("notBuyable");
                } else {
                    button.classList.remove("notBuyable");
                }
            });
        }
    
        function incrementAndDisplay() {
            if (!clickCooldown) {
                total += cookiesPerClick;
                clicks++;
                document.getElementById("total").innerText = total;
                document.getElementById("clicks").innerText = clicks;
                checkButtonBuyableStatus(); // Call the function to update button style
                showNotification("🍪 +1"); // Show the notification
                playClickSound(); // Play the click sound
                clickCooldown = true;
                setTimeout(function () {
                    clickCooldown = false;
                }, 50); // 0.05-second cooldown
            }
        }
    
        function playClickSound() {
            var clickSound = document.getElementById("clickSound");
            clickSound.pause();
            clickSound.currentTime = 0;
            clickSound.play();
        }
    
        // Updated buyButton function to handle iteration replacement
        function buyButton(cost, button) {
    var buttonCost = parseInt(cost);

    if (total >= buttonCost) {
        total -= buttonCost;

        // Update total cookies and display
        document.getElementById("total").innerText = total.toLocaleString(); // Format with commas

        // Hide the clicked button
        button.style.display = "none";

        // Show the next button
        var nextButton = button.nextSibling;
        while (nextButton && nextButton.nodeType !== 1) {
            nextButton = nextButton.nextSibling;
        }

        if (nextButton) {
            nextButton.style.display = "inline-block";
        }

        // Set interval for autoclickers
        var autoclickerInterval = setInterval(function () {
            var increment = getButtonRate(buttonCost);
            total += Math.round(increment);
            document.getElementById("total").innerText = total.toLocaleString();
            checkButtonBuyableStatus(); // Call the function to update button style
            showNotification("🍪 +1"); // Show the notification
        }, 1000);

        // Store the interval ID with the button
        button.autoclickerInterval = autoclickerInterval;

        // Show notification for autoclicker bought with a longer duration
        showNotification("Autoclicker Bought!", 3000);

        // Play sound for button purchase
        playBuySound();
    }
}
    
        function playBuySound() {
            var buySound = document.getElementById("buySound");
            buySound.pause();
            buySound.currentTime = 0;
            buySound.play();
        }
    
        function buyUpgradeButton(button) {
            var buttonCost = parseInt(button.getAttribute("data-cost"));
            var multiplier = parseInt(button.getAttribute("data-multiplier"));
    
            if (total >= buttonCost) {
                total -= buttonCost;
    
                // Update total cookies and display
                document.getElementById("total").innerText = total.toLocaleString(); // Format with commas
    
                // Apply the multiplier for each click
                cookiesPerClick *= multiplier;
    
                // Play the button purchase sound
                playBuySound();
    
                // Check for the next upgrade button
                var nextCost = buttonCost * 5; // Next cost is 5 times the current cost
                var nextMultiplier = 2; // Multiplier for the next upgrade
    
                // Get or create the next upgrade button
                var nextButton = getNextUpgradeButton(nextCost, nextMultiplier);
    
                // Display the next button if it exists
                if (nextButton) {
                    nextButton.style.display = "inline-block";
                }
    
                // Mark the current button as bought and hide it
                button.classList.add("bought");
                button.style.display = "none";
            }
        }
    
        function getNextUpgradeButton(cost, multiplier) {
    var nextButton = document.createElement("button");
    nextButton.className = "buyButton notBuyable";
    nextButton.setAttribute("data-cost", cost);
    nextButton.setAttribute("data-multiplier", multiplier);
    nextButton.onclick = function () {
        buyUpgradeButton(this);
    };
    var iteration = Math.log(cost / 10) / Math.log(3) + 1;
    var buttonName = getCookieButtonName(iteration);
    nextButton.innerText = "Upgrade cookie clicker" + " (-" + cost + " total cookies, " + multiplier + "* more cookies from pressing the cookie)";

    // Set the position to bottom left
    nextButton.style.position = "fixed";
    nextButton.style.top = "40%"; /* Adjust the distance from the bottom */
    nextButton.style.left = "50%"; /* Adjust the distance from the left */
    nextButton.style.transform = "translateX(-50%)"; /* Center the button horizontally */

    // Find the container for the autoclicker buttons
    var autoclickerContainer = document.getElementById("buttonGrid");

    // Insert the next button at the end of the autoclicker buttons container
    autoclickerContainer.appendChild(nextButton);

    console.log("Next button created:", nextButton);

    // Return the newly created button
    return nextButton;
}
    
        function showNotification(message, duration = 1000) {
            var notificationContainer = document.getElementById("notificationsContainer");
    
            // Create a notification element
            var notification = document.createElement("div");
            notification.className = "notification";
            notification.innerText = message;
    
            // Calculate random position within the entire screen
            var posX = getRandomInRange(0, window.innerWidth - notification.offsetWidth);
            var posY = getRandomInRange(0, window.innerHeight - notification.offsetHeight);
    
            // Ensure the notification is not covering buttons or "total cookies" text
            var elementsToAvoid = document.querySelectorAll(".buyButton, #displayArea, #clickTheCookie");
            elementsToAvoid.forEach(function (element) {
                var rect = element.getBoundingClientRect();
                if (
                    posX < rect.right &&
                    posX + notification.offsetWidth > rect.left &&
                    posY < rect.bottom &&
                    posY + notification.offsetHeight > rect.top
                ) {
                    // If there's an overlap, adjust the position
                    posX = rect.right;
                    posY = rect.bottom;
                }
            });
    
            // Set the notification position
            notification.style.left = posX + "px";
            notification.style.top = posY + "px";
    
            // Append the notification to the container
            notificationContainer.appendChild(notification);
    
            // Schedule removal after the specified duration
            setTimeout(function () {
                notification.style.transition = "opacity " + (duration / 1000) + "s ease-out";
                notification.style.opacity = 0;
    
                // Remove the notification after the transition
                setTimeout(function () {
                    notification.remove();
                }, duration);
            }, 10); // Delay added to ensure smooth fading
        }
    
        function getRandomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }
    
        function isOverlapping(posX, posY) {
            // Check if the position overlaps with any button
            var buttons = document.querySelectorAll(".buyButton");
            for (var i = 0; buttons && i < buttons.length; i++) {
                var rect = buttons[i].getBoundingClientRect();
                if (
                    posX < rect.right &&
                    posX + notification.offsetWidth > rect.left &&
                    posY < rect.bottom &&
                    posY + notification.offsetHeight > rect.top
                ) {
                    return true; // Overlapping
                }
            }
            return false; // Not overlapping
        }
    
        function startPop() {
            var cookieButton = document.getElementById("cookieButton");
            cookieButton.style.transform = "scale(1.1)";
        }
    
        function endPop() {
            var cookieButton = document.getElementById("cookieButton");
            cookieButton.style.transform = "scale(1)";
        }
    
        function getCookieButtonName(index) {
            // Add more names as needed
            var names = ["Cursor", "Grandma", "Potato Stand", "Mine", "Factory", "Bank", "Lemonade Stand", "Wizard Tower", "Shipment", "Alchemy Lab",
                "Portal", "Time Machine", "Antimatter Condenser", "Prism", "Chancemaker", "Fractal Engine", "Javascript Console",
                "Idleverse", "Idle Dimension", "Universal Paperclips", "Prune Juice", "Time Bandits", 
                "Timewarp Drive", "301 Redirect", "Reality Bending"];
            return names[index - 1] || "Unnamed"; // Default to "Unnamed" if out of names
        }
    
        function getButtonRate(cost) {
            // Formula for button rate, rounded to the nearest integer
            return Math.round(1 + (1 / 400) * cost);
        }
    
        var buttonGrid = document.getElementById("buttonGrid");
        for (var i = 1; i <= 25; i++) {
            createButtonIteration(i);
        }
    
        // Updated function to create button iterations
        function createButtonIteration(iteration) {
            var baseCost = 20 * Math.pow(4, iteration - 1);
    var buttonName = getCookieButtonName(iteration);

    // Create up to 10 iterations
    for (var i = 1; i <= 11; i++) {
        var button = document.createElement("button");
        button.className = "buyButton";
        var buttonCost = Math.round(baseCost * Math.pow(1.5, i - 1));
        var buttonRate = getButtonRate(baseCost);
        button.setAttribute("data-cost", buttonCost);
        button.style.display = i === 1 ? "inline-block" : "none"; // Display the first iteration, hide the rest
        button.onclick = function () {
            buyButton(this.getAttribute("data-cost"), this);
        };
        
        // Check if it's the final iteration
        if (i === 11) {
            button.onclick = function () {
                // Do nothing when clicked (10th iteration)
            };

            // Create the "Max" button
            var maxButton = document.createElement("button");
            maxButton.className = "maxButton";
            maxButton.style.display = "none"; // Initially hidden
            maxButton.innerText = "Max " + buttonName + " Bought!";
            buttonGrid.appendChild(maxButton);
        }

        button.innerText = "Buy " + buttonName + " " + i + " (-" + formatNumber(buttonCost) + ", +" + formatNumber(buttonRate) + "/sec)";
        buttonGrid.appendChild(button);
    }
        }
        // Initial update to set the correct buyable status
        checkButtonBuyableStatus();
    
        // Create sound control buttons
        var soundControl = document.createElement("div");
        soundControl.id = "soundControl";
        soundControl.style.position = "fixed";
        soundControl.style.top = "20px";
        soundControl.style.right = "20px";
        soundControl.style.display = "flex";
        soundControl.style.gap = "10px";
    
        var musicToggle = document.createElement("button");
        musicToggle.id = "musicToggle";
        musicToggle.onclick = function () {
            toggleMusic();
        };
        musicToggle.innerText = "🎵 Music 🔊";
        soundControl.appendChild(musicToggle);
    
        var audioToggle = document.createElement("button");
        audioToggle.id = "audioToggle";
        audioToggle.onclick = function () {
            toggleAudio();
        };
        audioToggle.innerText = "🔊 Audio 🔊";
        soundControl.appendChild(audioToggle);
    
        // Append sound control buttons to the body
        document.body.appendChild(soundControl);
    
        function formatNumber(number) {
            return number.toLocaleString();
        }