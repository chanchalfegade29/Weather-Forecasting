// API Keys and URLs (Using free public APIs)
const API_KEYS = {
    weather: 'YOUR_API_KEY_HERE', // Get free key from: https://openweathermap.org/api
    news: 'pub_63540a72a7e0d7d1e6f8b9c2a3d4e5f6', // NewsData.io (simulated - use real key)
};

const API_URLS = {
    weather: 'https://api.openweathermap.org/data/2.5/weather',
    crypto: 'https://api.coingecko.com/api/v3/coins/markets',
    quotes: 'https://api.quotable.io/random',
    weatherBackup: 'https://api.open-meteo.com/v1/forecast'
};

// Static mock data for demonstration
const MOCK_NEWS = [
    {
        title: 'Breakthrough in AI Technology Announced',
        description: 'Major tech companies unveil new artificial intelligence capabilities that promise to revolutionize multiple industries.',
        urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
        url: '#',
        publishedAt: '2 hours ago',
        source: 'Tech News'
    },
    {
        title: 'Global Climate Summit Reaches Historic Agreement',
        description: 'World leaders commit to ambitious carbon reduction targets in landmark environmental accord.',
        urlToImage: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b5?w=400&h=200&fit=crop',
        url: '#',
        publishedAt: '4 hours ago',
        source: 'World News'
    },
    {
        title: 'Stock Markets Hit New Record Highs',
        description: 'Major indices continue upward trajectory as investors respond positively to economic data.',
        urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop',
        url: '#',
        publishedAt: '5 hours ago',
        source: 'Business Daily'
    },
    {
        title: 'New Medical Treatment Shows Promise',
        description: 'Clinical trials demonstrate significant effectiveness in treating previously difficult conditions.',
        urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=200&fit=crop',
        url: '#',
        publishedAt: '6 hours ago',
        source: 'Health Today'
    },
    {
        title: 'Space Mission Achieves Major Milestone',
        description: 'International space agency successfully completes critical phase of deep space exploration program.',
        urlToImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=200&fit=crop',
        url: '#',
        publishedAt: '8 hours ago',
        source: 'Science News'
    },
    {
        title: 'Revolutionary Electric Vehicle Unveiled',
        description: 'Auto manufacturer introduces groundbreaking battery technology with unprecedented range and efficiency.',
        urlToImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=200&fit=crop',
        url: '#',
        publishedAt: '10 hours ago',
        source: 'Auto World'
    }
];

// Tab switching functionality
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Update active button
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load data based on tab
    switch(tabName) {
        case 'weather':
            fetchWeather();
            break;
        case 'news':
            fetchNews();
            break;
        case 'crypto':
            fetchCrypto();
            break;
        case 'quotes':
            fetchQuote();
            break;
    }
}

// Weather API Integration
async function fetchWeather() {
    const city = document.getElementById('city-input').value.trim() || 'London';
    const contentArea = document.getElementById('weather-content');

    contentArea.innerHTML = '<div class="loader"></div>';

    try {
        // First, get coordinates for the city using geocoding
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        
        if (!geoResponse.ok) {
            throw new Error('Unable to find city');
        }

        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found. Please try another city');
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country } = location;

        // Fetch weather data using coordinates
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,pressure_msl&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error('Unable to fetch weather data');
        }

        const weatherData = await weatherResponse.json();
        displayWeather({
            name: name,
            country: country,
            current: weatherData.current,
            units: weatherData.current_units
        });
        showToast('Weather data loaded successfully', 'success');
    } catch (error) {
        contentArea.innerHTML = `
            <div class="error-card">
                <h3>⚠️ Error Loading Weather</h3>
                <p>${error.message}</p>
            </div>
        `;
        showToast('Failed to load weather data', 'error');
    }
}

function displayWeather(data) {
    const contentArea = document.getElementById('weather-content');
    
    // Weather code descriptions
    const weatherDescriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };

    const temp = Math.round(data.current.temperature_2m);
    const feelsLike = Math.round(data.current.apparent_temperature);
    const description = weatherDescriptions[data.current.weather_code] || 'Unknown';
    const windSpeed = data.current.wind_speed_10m;
    const humidity = data.current.relative_humidity_2m;
    const pressure = data.current.pressure_msl;
    const cloudCover = data.current.cloud_cover;
    
    contentArea.innerHTML = `
        <div class="weather-card">
            <div class="location">${data.name}, ${data.country}</div>
            <div class="temp">${temp}°C</div>
            <div class="description">${description}</div>
            <div class="weather-details">
                <div class="weather-detail">
                    <div class="label">Feels Like</div>
                    <div class="value">${feelsLike}°C</div>
                </div>
                <div class="weather-detail">
                    <div class="label">Humidity</div>
                    <div class="value">${humidity}%</div>
                </div>
                <div class="weather-detail">
                    <div class="label">Wind Speed</div>
                    <div class="value">${windSpeed} km/h</div>
                </div>
                <div class="weather-detail">
                    <div class="label">Pressure</div>
                    <div class="value">${pressure} hPa</div>
                </div>
                <div class="weather-detail">
                    <div class="label">Precipitation</div>
                    <div class="value">${data.current.precipitation} mm</div>
                </div>
                <div class="weather-detail">
                    <div class="label">Cloud Cover</div>
                    <div class="value">${cloudCover}%</div>
                </div>
            </div>
        </div>
    `;
}

// News API Integration (Using mock data for demonstration)
async function fetchNews() {
    const category = document.getElementById('news-category').value;
    const contentArea = document.getElementById('news-content');
    
    contentArea.innerHTML = '<div class="loader"></div>';

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // In production, replace with actual News API call
        // const response = await fetch(`https://newsdata.io/api/1/news?apikey=${API_KEYS.news}&category=${category}`);
        // const data = await response.json();
        
        // Using mock data for demonstration
        const filteredNews = MOCK_NEWS.filter((_, index) => index < 6);
        displayNews(filteredNews);
        showToast('News loaded successfully', 'success');
    } catch (error) {
        contentArea.innerHTML = `
            <div class="error-card">
                <h3>⚠️ Error Loading News</h3>
                <p>Unable to fetch news articles. Please try again later.</p>
            </div>
        `;
        showToast('Failed to load news', 'error');
    }
}

function displayNews(articles) {
    const contentArea = document.getElementById('news-content');
    
    const newsHTML = articles.map(article => `
        <div class="news-card">
            <img src="${article.urlToImage}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/400x200?text=News+Image'">
            <div class="news-card-content">
                <h3>${article.title}</h3>
                <p>${article.description}</p>
                <div class="news-meta">
                    <span>${article.source}</span>
                    <span>${article.publishedAt}</span>
                </div>
                <a href="${article.url}" class="read-more" target="_blank">Read More →</a>
            </div>
        </div>
    `).join('');

    contentArea.innerHTML = `<div class="news-grid">${newsHTML}</div>`;
}

// Cryptocurrency API Integration
async function fetchCrypto() {
    const contentArea = document.getElementById('crypto-content');
    contentArea.innerHTML = '<div class="loader"></div>';

    try {
        const response = await fetch(`${API_URLS.crypto}?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=false`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch cryptocurrency data');
        }

        const data = await response.json();
        displayCrypto(data);
        showToast('Crypto data loaded successfully', 'success');
    } catch (error) {
        contentArea.innerHTML = `
            <div class="error-card">
                <h3>⚠️ Error Loading Crypto Data</h3>
                <p>Unable to fetch cryptocurrency prices. Please try again later.</p>
            </div>
        `;
        showToast('Failed to load crypto data', 'error');
    }
}

function displayCrypto(coins) {
    const contentArea = document.getElementById('crypto-content');
    
    const cryptoHTML = coins.map(coin => {
        const priceChange = coin.price_change_percentage_24h;
        const changeClass = priceChange >= 0 ? 'positive' : 'negative';
        const changeSymbol = priceChange >= 0 ? '+' : '';
        
        return `
            <div class="crypto-card">
                <div class="crypto-header">
                    <img src="${coin.image}" alt="${coin.name}" class="crypto-icon">
                    <div class="crypto-info">
                        <h3>${coin.name}</h3>
                        <div class="crypto-symbol">${coin.symbol.toUpperCase()}</div>
                    </div>
                </div>
                <div class="crypto-price">$${coin.current_price.toLocaleString()}</div>
                <div class="crypto-change ${changeClass}">
                    ${changeSymbol}${priceChange.toFixed(2)}%
                </div>
                <div class="crypto-details">
                    <div class="crypto-detail">
                        <div class="label">Market Cap</div>
                        <div class="value">$${(coin.market_cap / 1e9).toFixed(2)}B</div>
                    </div>
                    <div class="crypto-detail">
                        <div class="label">24h Volume</div>
                        <div class="value">$${(coin.total_volume / 1e9).toFixed(2)}B</div>
                    </div>
                    <div class="crypto-detail">
                        <div class="label">24h High</div>
                        <div class="value">$${coin.high_24h.toLocaleString()}</div>
                    </div>
                    <div class="crypto-detail">
                        <div class="label">24h Low</div>
                        <div class="value">$${coin.low_24h.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    contentArea.innerHTML = `<div class="crypto-grid">${cryptoHTML}</div>`;
}

// Quotes API Integration
async function fetchQuote() {
    const contentArea = document.getElementById('quotes-content');
    contentArea.innerHTML = '<div class="loader"></div>';

    try {
        // Using DummyJSON API for quotes (no CORS issues)
        const response = await fetch('https://dummyjson.com/quotes/random');
        
        if (!response.ok) {
            throw new Error('Failed to fetch quote');
        }

        const data = await response.json();
        displayQuote({
            content: data.quote,
            author: data.author,
            tags: []
        });
        showToast('Quote loaded successfully', 'success');
    } catch (error) {
        // Fallback to local quotes if API fails
        const fallbackQuotes = [
            { content: "The only way to do great work is to love what you do.", author: "Steve Jobs", tags: ["motivation"] },
            { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", tags: ["innovation"] },
            { content: "Life is what happens when you're busy making other plans.", author: "John Lennon", tags: ["life"] },
            { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", tags: ["inspiration"] },
            { content: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", tags: ["wisdom"] },
            { content: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", tags: ["individuality"] },
            { content: "The only impossible journey is the one you never begin.", author: "Tony Robbins", tags: ["motivation"] },
            { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", tags: ["success"] }
        ];
        
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        displayQuote(randomQuote);
        showToast('Quote loaded successfully', 'success');
    }
}

function displayQuote(data) {
    const contentArea = document.getElementById('quotes-content');
    
    contentArea.innerHTML = `
        <div class="quote-card">
            <div class="quote-icon">"</div>
            <div class="quote-text">${data.content}</div>
            <div class="quote-author">— ${data.author}</div>
            ${data.tags ? `<div class="quote-category">${data.tags.join(', ')}</div>` : ''}
        </div>
    `;
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize with weather tab
window.addEventListener('DOMContentLoaded', () => {
    fetchWeather();
});

// Allow Enter key for weather search
document.getElementById('city-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchWeather();
    }
});
