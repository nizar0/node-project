const axios = require("axios");

exports.getWeather = async (req, res) => {
    try {
        const { city } = req.params;
        console.log('city',city)
        const apiKey = "9d2f82e2af49851b3555bc545a2fa605";
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching weather data:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
};
