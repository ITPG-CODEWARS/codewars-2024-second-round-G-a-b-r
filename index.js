document.getElementById("urlForm").addEventListener("submit", generateShortUrl);

const urlDatabase = {};
const userUrls = []; // Массив за съхранение на кратки URL адреси

function generateShortUrl(event) {
    event.preventDefault();

    const longUrl = document.getElementById("longUrl").value;
    const customAlias = document.getElementById("customAlias").value;
    const length = parseInt(document.getElementById("length").value);
    const expiry = parseInt(document.getElementById("expiry").value);
    const maxUsage = parseInt(document.getElementById("maxUsage").value);
    const password = document.getElementById("password").value;

    let shortUrl = customAlias || generateRandomString(length);

    if (urlDatabase[shortUrl]) {
        document.getElementById("result").innerText = "Този кратък URL вече съществува!";
        return;
    }

    urlDatabase[shortUrl] = {
        longUrl,
        expiry: Date.now() + expiry * 24 * 60 * 60 * 1000,
        maxUsage,
        usageCount: 0,
        password: password ? hashPassword(password) : null
    };

    // Добавяне на краткия URL към списъка на потребителя
    userUrls.push(shortUrl);

    // Показване на резултата
    displayResult(shortUrl);
    generateQRCode(shortUrl);

    // Обновяване на списъка с кратки URL адреси
    updateShortUrlsList();
}

function generateRandomString(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function hashPassword(password) {
    return btoa(password);
}

function displayResult(shortUrl) {
    const resultDiv = document.getElementById("result");
    const shortUrlLink = `https://your.domain/${shortUrl}`;
    resultDiv.innerHTML = `<p>Кратък URL: <a href="#" onclick="redirectToOriginalUrl('${shortUrl}')">${shortUrlLink}</a></p>`;

    // Показване на бутона и QR кода
    document.getElementById("downloadQR").classList.add("centered");
    document.getElementById("qrCodeCanvas").style.display = "block";
    document.getElementById("downloadQR").disabled = false; // Включване на бутона за изтегляне
}

function generateQRCode(shortUrl) {
    const urlData = urlDatabase[shortUrl];
    if (!urlData) {
        alert("Няма такъв URL адрес.");
        return;
    }

    const qr = new QRious({
        element: document.getElementById("qrCodeCanvas"),
        value: urlData.longUrl
    });

    // Ако QR кодът не е генериран, блокирайте бутона за изтегляне
    if (document.getElementById("qrCodeCanvas").toDataURL() === document.createElement("canvas").toDataURL()) {
        document.getElementById("downloadQR").disabled = true;
    }
}

document.getElementById("downloadQR").addEventListener("click", () => {
    const qrCanvas = document.getElementById("qrCodeCanvas");

    // Проверка дали QR кодът е генериран
    if (qrCanvas.toDataURL() === document.createElement("canvas").toDataURL()) {
        alert("QR кодът не е генериран. Моля, генерирайте QR код първо.");
        return;
    }

    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrCanvas.toDataURL();
    link.click();
});

// Функция за показване на съществуващите кратки URL адреси
// Функция за показване на съществуващите кратки URL адреси
function updateShortUrlsList() {
    const listContainer = document.getElementById("shortUrlsList");
    listContainer.innerHTML = ""; // Изчистваме текущия списък

    userUrls.forEach(shortUrl => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#"; // Премахваме директната връзка, за да използваме redirect функцията
        link.innerText = `https://your.domain/${shortUrl}`;
        link.addEventListener("click", function(event) {
            event.preventDefault(); // Спираме стандартното действие на линка
            redirectToOriginalUrl(shortUrl); // Извикваме функцията за пренасочване
        });
        listItem.appendChild(link);
        listContainer.appendChild(listItem);
    });
}


// Пренасочване към оригиналния URL адрес
// Пренасочване към оригиналния URL адрес
function redirectToOriginalUrl(shortUrl) {
    const urlData = urlDatabase[shortUrl];
    if (!urlData) {
        alert("Няма такъв URL адрес.");
        return;
    }

    // Проверка за парола, срок на валидност и максимални използвания
    if (urlData.password) {
        const enteredPassword = prompt("Въведете парола за достъп:");
        
        if (hashPassword(enteredPassword) !== urlData.password) {
            // Покажи съобщение за грешна парола
            showPasswordError("Грешна парола! Опитайте отново.");
            return;
        } else {
            // Скрий съобщението за грешна парола, ако паролата е правилна
            hidePasswordError();
        }
    }

    // Проверка дали линкът е изтекъл
    if (Date.now() > urlData.expiry) {
        alert("Този URL е изтекъл и не може да бъде използван!");
        return;
    }

    urlData.usageCount++;
    if (urlData.usageCount > urlData.maxUsage) {
        alert("Този URL е достигнал максималния брой използвания.");
        return;
    }

    // Пренасочване към оригиналния URL адрес в нов прозорец/раздел
    window.open(urlData.longUrl, '_blank');
}


// Функции за показване/скриване на съобщение за грешна парола
function showPasswordError(message) {
    const errorDiv = document.getElementById("passwordError");
    errorDiv.innerText = message;
    errorDiv.style.display = "block";
}

function hidePasswordError() {
    const errorDiv = document.getElementById("passwordError");
    errorDiv.style.display = "none";
}

// Функция за превключване на видимостта на паролата
document.getElementById("togglePassword").addEventListener("click", function () {
    const passwordField = document.getElementById("password");
    const passwordType = passwordField.type === "password" ? "text" : "password";
    passwordField.type = passwordType;
});

// Функция за показване на съществуващите кратки URL адреси
function updateShortUrlsList() {
    const listContainer = document.getElementById("shortUrlsList");
    listContainer.innerHTML = ""; // Изчистваме текущия списък

    userUrls.forEach(shortUrl => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#"; // Премахваме директната връзка, за да използваме redirect функцията
        link.innerText = `https://your.domain/${shortUrl}`;
        link.addEventListener("click", function(event) {
            event.preventDefault(); // Спираме стандартното действие на линка
            redirectToOriginalUrl(shortUrl); // Извикваме функцията за пренасочване
        });
        listItem.appendChild(link);
        listContainer.appendChild(listItem);
    });
}

document.getElementById("clearUrl").addEventListener("click", () => {
    document.getElementById("longUrl").value = ""; // Изчиства полето за URL
});





















