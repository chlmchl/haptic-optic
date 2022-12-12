let allNamesElm = document.getElementById("allNames")
let errorMessageElm = document.getElementById("errorMessage")
let images = []

function setErrorDisplay(){
	allNamesElm.style.display = "none"
	errorMessageElm.style.display = "block"
}

function get_data_array() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      data_array = JSON.parse(this.responseText).values
      console.log(data_array)

      for (let i = 1; i < data_array.length; i++) {
        let rowInfo = data_array[i]
        let rowInfoDiv = document.createElement("div")
        rowInfoDiv.classList.add("name-row")
        const x = Math.random() * (window.innerWidth)
        const y = Math.random() * (window.innerHeight)
        rowInfoDiv.style.position = 'absolute'
        rowInfoDiv.style.left = x + 'px'
        rowInfoDiv.style.top = y + 'px'
        const tFloat = 10 + Math.random() * 50
        rowInfoDiv.style.animation = `float ${tFloat}s linear alternate infinite`

        let rowImage = document.createElement("img")
        let rowImageNode = document.createTextNode(rowInfo[5])
        console.log(rowImageNode)
        rowImage.src = "../img/" + rowImageNode.nodeValue
        //Randomize size and position of images 

        
        rowImage.width = 70 + Math.random() * 300
        
        const time = 10 + Math.random() * 10
        rowImage.style.animation = `blur ${time}s ease alternate infinite`
        //rowImage.style.opacity = Math.random(0.1, 1)
        //rowImage.style.filter = "blur(" + Math.random(1, 15) +"px)"
        rowImage.classList.add("image")

        let rowName = document.createElement("h4")
        let rowNameNode = document.createTextNode(rowInfo[2])
        rowName.appendChild(rowNameNode)
        rowName.classList.add("title")

        let rowWritten = document.createElement("p")
        let rowWrittenNode = document.createTextNode(rowInfo[3])
        rowWritten.appendChild(rowWrittenNode)
        rowWritten.classList.add("date")

        let rowAudio = document.createElement("p")
        let rowAudioNode = document.createTextNode(rowInfo[7])
        rowAudio.appendChild(rowAudioNode)
        rowAudio.classList.add("credits")

        rowInfoDiv.appendChild(rowImage)
        rowInfoDiv.appendChild(rowName)
        rowInfoDiv.appendChild(rowWritten)
        rowInfoDiv.appendChild(rowAudio)

        allNamesElm.appendChild(rowInfoDiv)
      }

      allNamesElm.style.display = "block"

    }
  };
  xhttp.open("GET", "https://sheets.googleapis.com/v4/spreadsheets/1WtwrA3Bou1MluhOmcEFiJSNBVFt5aq_1821tFXLiehI/values/index?key=AIzaSyDhlpOIwLeSZUTfp1OUPRagso6CMgbMzOA");
  xhttp.send();
}

get_data_array()