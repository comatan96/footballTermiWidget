// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;
// FCB fixtures widget

// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: image;


// Change to true to see a preview of your widget.
const testMode = true

// Optionally specify the size of your widget preview.
const widgetSize = "medium"

// Can be top, middle, or bottom.
const verticalAlignment = "middle"

// Can be left, center, or right.
const horizontalAlignment = "center"

// Use iosfonts.com, or change to "" for the system font.
const fontName = "DIN condensed"

// Find colors on htmlcolorcodes.com
const fontColor = new Color("#ffffff")

// Change the font sizes for each element.
const headerSize = 35
const competitionAndStadiumSize = 25
const nextRivalDateSize = 25
const nextRivalNameSize = 30

// Change to true to reset the widget background.
const resetWidget = false

// background image
const background = "https://www.fcbarcelonanoticias.com/uploads/s1/11/69/48/3/camp-nou-nuevo-constructoras.jpeg"

// ============== Logic of the script

let widget = new ListWidget()

let img = new Request(background)
bgimg = await img.loadImage()

widget.backgroundImage = bgimg


if (verticalAlignment == "middle" || verticalAlignment == "bottom") {
    widget.addSpacer()
}

// Store all of the widget text.
let widgetText = []

// get the data from the API
const footballDataKey = "YOUR-API-KEY";
const myTeamId = 81
const footballData = "https://api.football-data.org/v2/teams/" + myTeamId + "/matches?status=SCHEDULED";
const teamAPI = "https://api.football-data.org/v2/teams/"

// next match request
const footballDataRequest = new Request(footballData)
footballDataRequest.method = "GET"
footballDataRequest.headers = {'X-Auth-Token': footballDataKey}
let fbResponse = await footballDataRequest.loadJSON()

// next match stadium request
var stadiumRequest = new Request(teamAPI + homeId)
stadiumRequest.method = "GET"
stadiumRequest.headers = {'X-Auth-Token': footballDataKey}
let teamInfo = await stadiumRequest.loadJSON()


/* -- parse the data -- */

// next rival match info
let nextRival = fbResponse["matches"][0]

let homeId = nextRival["homeTeam"]["id"]
let awayId = nextRival["awayTeam"]["id"]
let stadium = teamInfo["venue"]

// parse date
let dateFromJson = new Date(nextRival["utcDate"])
let localDate = dateFromJson.toDateString()
let localTime = dateFromJson.toLocaleTimeString('he-IL').replace(/(.*)\D\d+/, '$1')
var awayTeam = nextRival["awayTeam"]["name"]
var homeTeam = nextRival["homeTeam"]["name"]
var competition = fixLaLigaName(nextRival["competition"]["name"])

// set the widget
let nextRivalHeader = widget.addText("NEXT FIXTURE")
let nextRivalName = widget.addText(homeTeam + " - " + awayTeam)
let competitionName = widget.addText(competition + " @ " + stadium)
let nextRivalDate = widget.addText(localDate + ", " + localTime)

// set fonts
nextRivalHeader.font = provideFont(fontName, headerSize)
nextRivalName.font = provideFont(fontName, nextRivalNameSize)
competitionName.font = provideFont(fontName, competitionAndStadiumSize)
nextRivalDate.font = provideFont(fontName, nextRivalDateSize)

// push to stack
widgetText.push(nextRivalHeader)
widgetText.push(nextRivalName)
widgetText.push(competitionName)
widgetText.push(nextRivalDate)


// Format the text for all widget text.
for (const textItem of widgetText) {
    textItem.textColor = fontColor
    if (horizontalAlignment == "right") { textItem.rightAlignText() }
    else if (horizontalAlignment == "center") { textItem.centerAlignText() }
    else { textItem.leftAlignText() }
}

if (verticalAlignment == "top" || verticalAlignment == "middle") { widget.addSpacer() }

Script.setWidget(widget)
if (testMode) {
    let widgetSizeFormat = widgetSize.toLowerCase()
    if (widgetSizeFormat == "small") { widget.presentSmall() }
    if (widgetSizeFormat == "medium") { widget.presentMedium() }
    if (widgetSizeFormat == "large") { widget.presentLarge() }
}
Script.complete()

// fixt the name of LaLiga from Primera Division
function fixLaLigaName(name) {
    if (name === "Primera Division") {
        return "La Liga"
    }
    return name
}

// Provide the specified font.
function provideFont(fontName, fontSize) {
    if (fontName == "" || fontName == null) {
        return Font.regularSystemFont(fontSize)
    } else {
        return new Font(fontName, fontSize)
    }
}