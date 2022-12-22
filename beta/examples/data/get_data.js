let images = []
let credits = []
let date = []
let author = []

class GetData {
    GetDataArray() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
        let data_array = JSON.parse(this.responseText).values
        //console.log(data_array)

        for (let i = 1; i < data_array.length; i++) {
            let rowInfo = data_array[i]
            let rowImageNode = document.createTextNode(rowInfo[5])
            let rowImage = "./img/" + rowImageNode.nodeValue
            images.push(rowImage)

            

            // let rowNameNode = document.createTextNode(rowInfo[2])
            // title.push()
            // let rowWrittenNode = document.createTextNode(rowInfo[3])

            // let rowAudioNode = document.createTextNode(rowInfo[7])
        
        }
        
        
        }
    };
    xhttp.open("GET", "https://sheets.googleapis.com/v4/spreadsheets/1WtwrA3Bou1MluhOmcEFiJSNBVFt5aq_1821tFXLiehI/values/index?key=AIzaSyDhlpOIwLeSZUTfp1OUPRagso6CMgbMzOA");
    xhttp.send();
    console.log(images);
    return images;
    
    }
}

export{GetData}