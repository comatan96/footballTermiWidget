// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: calculator;

// Change these to your usernames!
const user = "matan";

// API PARAMETERS !important
// WEATHER_API_KEY, you need an Open Weather API Key
// You can get one for free at: https://home.openweathermap.org/api_keys (account needed).

const WEATHER_API_KEY = "";
const DEFAULT_LOCATION = {
    latitude: 0,
    longitude: 0
};
const TEAM_ID = 133739
const teamDetailUrl = "https://www.thesportsdb.com/api/v1/json/1/lookupteam.php?id="
const leagueDetailUrl = "https://www.thesportsdb.com/api/v1/json/1/lookupleague.php?id="
const teamUrl = teamDetailUrl + TEAM_ID
let r = new Request(teamUrl)
let teamDetail = await r.loadJSON()
let myTeamLogo = await getTeamImg(TEAM_ID)
// const fontName = "DIN condensed"
const calendarIcon = "https://www.thesportsdb.com/images/icons/calendar-next.png"
const Cache = importModule('cache');
const font = "Menlo"
const cache = new Cache("termiWidgetCache");
const data = await fetchData();
const widget = createWidget(data);
Script.setWidget(widget);
Script.complete();

function createWidget(data) {
    console.log(data)
    const w = new ListWidget()
    const bgColor = new LinearGradient()
    bgColor.colors = [new Color("#29323c"), new Color("#1c1c1c")]
    bgColor.locations = [0.0, 1.0]
    w.backgroundGradient = bgColor
    w.setPadding(12, 15, 15, 12)

    const stack = w.addStack();
    stack.layoutHorizontally();

    const leftStack = stack.addStack();
    leftStack.layoutVertically();
    leftStack.spacing = 6;
    leftStack.size = new Size(220, 0);

    const time = new Date()
    const dfTime = new DateFormatter()
    dfTime.locale = "en"
    dfTime.useMediumDateStyle()
    dfTime.useNoTimeStyle()

    const firstLine = leftStack.addText(`[] ${user} ~$ now`)
    firstLine.textColor = Color.white()
    firstLine.textOpacity = 0.7
    firstLine.font = new Font(font, 11)

    const timeLine = leftStack.addText(`[🗓] ${dfTime.string(time)}`)
    timeLine.textColor = Color.white()
    timeLine.font = new Font(font, 11)

    const batteryLine = leftStack.addText(`[🔋] ${renderBattery()}`)
    batteryLine.textColor = new Color("#6ef2ae")
    batteryLine.font = new Font(font, 11)

    const locationLine = leftStack.addText(`[️️📍] Location: ${data.weather.location}`)
    locationLine.textColor = new Color("#7dbbae")
    locationLine.font = new Font(font, 11)

    addGameLine(leftStack, data.game.homeTeamLogo, data.game.homeTeamName, data.game.awayTeamLogo, data.game.awayTeamName)
    addGameDateLine(leftStack, data.game.date, data.game.stadium)
    stack.addSpacer();
    const rightStack = stack.addStack();
    rightStack.spacing = 2;
    rightStack.layoutVertically();
    rightStack.bottomAlignContent();

    addWeatherLine(rightStack, data.weather.icon, 32);
    addWeatherLine(rightStack, `${data.weather.description}, ${data.weather.temperature}°`, 12, true);
    addWeatherLine(rightStack, `High: ${data.weather.high}°`);
    addWeatherLine(rightStack, `Low: ${data.weather.low}°`);
    addWeatherLine(rightStack, `Wind: ${data.weather.wind} mph`);

    return w
}

function addGameLine(w, homeLogoUrl, homeTeamName, awayLogoUrl, awayTeamName) {
    const stack = w.addStack();
    stack.setPadding(0, 0, 0, 0);
    stack.layoutHorizontally();
    const footbal = stack.addText("[⚽] ")
    footbal.textColor = new Color("#a82537");
    footbal.font = new Font(font, 11);
    homeImage = stack.addImage(homeLogoUrl);
    homeImage.imageSize = new Size(12, 12)
    const match = stack.addText(" " + homeTeamName + " - " + awayTeamName + " ");
    match.textColor = new Color("#a82537");
    match.font = new Font(font, 11);
    awayImage = stack.addImage(awayLogoUrl);
    awayImage.imageSize = new Size(12, 12);
}

function addGameDateLine(w, date, stadium) {
    const stack = w.addStack();
    date = new Date(Date.parse(date));
    let localDate = date.toLocaleDateString('he-IL');
    let localTime = date.toLocaleTimeString('he-IL').replace(/(.*)\D\d+/, '$1');
    stack.setPadding(0, 0, 0, 0);
    arrow = stack.addText(" ↳ ");
    arrow.font = new Font(font, 17);
    stack.centerAlignContent();
    arrow.textColor = new Color("#a82537");
    date = stack.addText(`${localDate}, ${localTime} @ ${stadium}`);
    date.textColor = new Color("#a82537");
    date.font = new Font(font, 11);
}

function addWeatherLine(w, text, size, bold) {
    const stack = w.addStack();
    stack.setPadding(0, 0, 0, 0);
    stack.layoutHorizontally();
    stack.addSpacer();
    const line = stack.addText(text);
    line.textColor = new Color("#ffcc66");
    line.font = new Font(font + (bold ? "-Bold" : ""), size || 11);
}

async function fetchData() {
    const weather = await fetchWeather();
    const game = await fetchNextGame();

    return {
        weather,
        game
    }
}

async function fetchNextGame() {
    const eventsUrl = "https://www.thesportsdb.com/api/v1/json/1/eventsnext.php?id=" + TEAM_ID
    let req = new Request(eventsUrl)
    let res = await req.loadJSON()
    let nextFixture = res.events[0]
    // set home and away logo
    let homeLogo = ""
    let awayLogo = ""
    if (nextFixture.idHomeTeam == TEAM_ID) {
        homeLogo = myTeamLogo
        awayLogo = await getTeamImg(nextFixture.idAwayTeam)
    } else {
        homeLogo = await getTeamImg(nextFixture.idHomeTeam)
        awayLogo = myTeamLogo
    }
    // get next fixture data
    // parse date
    return {
        homeTeamName: nextFixture.strHomeTeam,
        homeTeamLogo: homeLogo,
        awayTeamName: nextFixture.strAwayTeam,
        awayTeamLogo: awayLogo,
        date: nextFixture.strTimestamp,
        stadium: nextFixture.strVenue
    }
}

// get team logo by id
async function getTeamImg(id) {
    let teamUrl = teamDetailUrl + id
    let req = new Request(teamUrl)
    let res = await req.loadJSON()
    let imageUrl = res.teams[0].strTeamBadge + "/preview"
    let imgReq = new Request(imageUrl)
    let img = await imgReq.loadImage()
    return img
}

function renderBattery() {
    const batteryLevel = Device.batteryLevel()
    const juice = "#".repeat(Math.floor(batteryLevel * 8))
    const used = ".".repeat(8 - juice.length)
    const batteryAscii = `[${juice}${used}] ${Math.round(batteryLevel * 100)}%`
    return batteryAscii
}

async function fetchWeather() {
    let location = await cache.read('location');
    if (!location) {
        try {
            Location.setAccuracyToThreeKilometers();
            location = await Location.current();
        } catch (error) {
            location = await cache.read('location');
        }
    }
    if (!location) {
        location = DEFAULT_LOCATION;
    }
    const address = await Location.reverseGeocode(location.latitude, location.longitude);
    const url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + location.latitude + "&lon=" + location.longitude + "&exclude=minutely,hourly,alerts&units=metric&lang=he&appid=" + WEATHER_API_KEY;
    const data = await fetchJson(`weather_${address[0].locality}`, url);

    return {
        location: address[0].locality,
        icon: getWeatherEmoji(data.current.weather[0].id, ((new Date()).getTime() / 1000) >= data.current.sunset),
        description: data.current.weather[0].main,
        temperature: Math.round(data.current.temp),
        wind: Math.round(data.current.wind_speed),
        high: Math.round(data.daily[0].temp.max),
        low: Math.round(data.daily[0].temp.min),
    }
}


async function fetchJson(key, url, headers) {
    const cached = await cache.read(key, 5);
    if (cached) {
        return cached;
    }

    try {
        console.log(`Fetching url: ${url}`);
        const req = new Request(url);
        req.headers = headers;
        const resp = await req.loadJSON();
        cache.write(key, resp);
        return resp;
    } catch (error) {
        try {
            return cache.read(key, 5);
        } catch (error) {
            console.log(`Couldn't fetch ${url}`);
        }
    }
}

function getWeatherEmoji(code, isNight) {
    if (code >= 200 && code < 300 || code == 960 || code == 961) {
        return "⛈"
    } else if ((code >= 300 && code < 600) || code == 701) {
        return "🌧"
    } else if (code >= 600 && code < 700) {
        return "❄️"
    } else if (code == 711) {
        return "🔥"
    } else if (code == 800) {
        return isNight ? "🌕" : "☀️"
    } else if (code == 801) {
        return isNight ? "☁️" : "🌤"
    } else if (code == 802) {
        return isNight ? "☁️" : "⛅️"
    } else if (code == 803) {
        return isNight ? "☁️" : "🌥"
    } else if (code == 804) {
        return "☁️"
    } else if (code == 900 || code == 962 || code == 781) {
        return "🌪"
    } else if (code >= 700 && code < 800) {
        return "🌫"
    } else if (code == 903) {
        return "🥶"
    } else if (code == 904) {
        return "🥵"
    } else if (code == 905 || code == 957) {
        return "💨"
    } else if (code == 906 || code == 958 || code == 959) {
        return "🧊"
    } else {
        return "❓"
    }
}