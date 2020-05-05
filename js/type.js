function typeEffect(element, speed) {
	var text = element.innerHTML;
	element.innerHTML = "";

	var i = 0;
	var timer = setInterval(function() {
    if (i < text.length) {
      element.append(text.charAt(i));
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
}


// application
var speed = 75;
var h1 = document.querySelector('h1');
var h2 = document.querySelector('h2');
var delay = h1.innerHTML.length * speed + speed;

// type affect to header
typeEffect(h1, speed);


// type affect to body
setTimeout(function(){
  h2.style.display = "inline-block";
  typeEffect(h2, speed);
}, delay);
