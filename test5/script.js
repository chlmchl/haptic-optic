var element = document.getElementById('target1');
var fingers = new Fingers(element);
var gesture1 = fingers.addGesture(Fingers.gesture.Tap);
var gesture2 = fingers.addGesture(Fingers.gesture.Hold);



var element = document.getElementById('target2');
var fingers = new Fingers(element);
var gesture1 = fingers.addGesture(Fingers.gesture.Tap);
gesture1.addHandler(function(eventType, data, fingerList) {
    alert('Tap 1');
});
gesture1.addHandler(function(eventType, data, fingerList) {
    alert('Tap 2');
});

var element = document.getElementById('target3');
new Fingers(element)
    .addGesture(Fingers.gesture.Tap)
    .addHandler(function(eventType, data, fingerList) {
        //eventType === Fingers.Gesture.EVENT_TYPE.instant
    });