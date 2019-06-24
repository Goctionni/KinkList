<!DOCTYPE html>
<html>
<head>
    <title>Kinklist</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="//code.jquery.com/jquery-2.1.4.min.js"></script>
    <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMTAvMjEvMTV5ehY1AAAAZElEQVQ4jaWTwQ3AIAwDbcT+I9f9hjYQA/mAkO7igKAACWdFAF0A2gb0hP0uCyTATyAJSoaK5xGyEmTC9lktmORUdAQvBQ5cJshktoDk0HkmKRNUEmuE6ztYVXe7bT+jW7z9zi8qYiodCjCHKgAAAABJRU5ErkJggg==">
    <link rel="stylesheet" href="/css/app.css">
</head>
<body>
    <div class="widthWrapper">
        <button id="Edit"></button>
        <h1>Kink list</h1>
        <div class="legend">
            <div><span data-color="#FFFFFF" class="choice notEntered"></span> <span class="legend-text">Not Entered</span></div>
            <div><span data-color="#6DB5FE" class="choice favorite"></span> <span class="legend-text">Favorite</span></div>
            <div><span data-color="#23FD22" class="choice like"></span> <span class="legend-text">Like</span></div>
            <div><span data-color="#FDFD6B" class="choice okay"></span> <span class="legend-text">Okay</span></div>
            <div><span data-color="#DB6C00" class="choice maybe"></span> <span class="legend-text">Maybe</span></div>
            <div><span data-color="#920000" class="choice no"></span> <span class="legend-text">No</span></div>
        </div>
        <div id="ExportWrapper">
            <input type="text" id="URL">
            <button id="Export">Export</button>
            <div id="Loading">Loading</div>
        </div>
        <button id="StartBtn"></button>
        <div id="InputList"></div>
    </div>
    <div id="EditOverlay" class="overlay">
        <textarea id="Kinks">
#Bodies
(General)
* Skinny
* Chubby
* Small breasts
* Large breasts
* Small cocks
* Large cocks

#Clothing
(Self, Partner)
* Clothed sex
* Lingerie
* Stockings
* Heels
* Leather
* Latex
* Uniform / costume
* Cross-dressing

#Groupings
(General)
* You and 1 male
* You and 1 female
* You and MtF trans
* You and FtM trans
* You and 1 male, 1 female
* You and 2 males
* You and 2 females
* Orgy

#General
(Giving, Receiving)
* Romance / Affection
* Handjob / fingering
* Blowjob
* Deep throat
* Swallowing
* Facials
* Cunnilingus
* Face-sitting
* Edging
* Teasing
* JOI, SI

#Ass play
(Giving, Receiving)
* Anal toys
* Anal sex, pegging
* Rimming
* Double penetration
* Anal fisting

#Restrictive
(Self, Partner)
* Gag
* Collar
* Leash
* Chastity
* Bondage (Light)
* Bondage (Heavy)
* Encasement

#Toys
(Self, Partner)
* Dildos
* Plugs
* Vibrators
* Sounding

#Domination
(Dominant, Submissive)
* Dominant / Submissive
* Domestic servitude
* Slavery
* Pet play
* DD/lg, MD/lb
* Discipline
* Begging
* Forced orgasm
* Orgasm control
* Orgasm denial
* Power exchange

#No consent
(Aggressor, Target)
* Non-con / rape
* Blackmail / coercion
* Kidnapping
* Drugs / alcohol
* Sleep play

#Taboo
(General)
* Incest
* Ageplay
* Interracial / Raceplay
* Bestiality
* Necrophilia
* Cheating
* Exhibitionism
* Voyeurism

#Surrealism
(Self, Partner)
* Futanari
* Furry
* Vore
* Transformation
* Tentacles
* Monster or Alien

#Fluids
(General)
* Blood
* Watersports
* Scat
* Lactation
* Diapers
* Cum play

#Degradation
(Giving, Receiving)
* Glory hole
* Name calling
* Humiliation

#Touch & Stimulation
(Actor, Subject)
* Cock/Pussy worship
* Ass worship
* Foot play
* Tickling
* Sensation play
* Electro stimulation

#Misc. Fetish
(Giving, Receiving)
* Fisting
* Gangbang
* Breath play
* Impregnation
* Pregnancy
* Feminization
* Cuckold / Cuckquean

#Pain
(Giving, Receiving)
* Light pain
* Heavy pain
* Nipple clamps
* Clothes pins
* Caning
* Flogging
* Beating
* Spanking
* Cock/Pussy slapping
* Cock/Pussy torture
* Hot Wax
* Scratching
* Biting
* Cutting
        </textarea>
        <button id="KinksOK">Accept</button>
    </div>
    <div id="InputOverlay" class="overlay">
        <div class="widthWrapper">
            <div id="InputPrevious"></div>
            <div id="InputCurrent">
                <h2 id="InputCategory"></h2>
                <h3 id="InputField"></h3>
                <button class="closePopup">&times;</button>
                <div id="InputValues"></div>
            </div>
            <div id="InputNext"></div>
        </div>
    </div>
    <script src="/js/app.js"></script>
</body>
</html>