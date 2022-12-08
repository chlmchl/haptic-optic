// Create an array of image URLs
const imageUrls = [
	'../img/img1.jpg',
	'../img/img2.png',
	'../img/img3.png',
	'../img/img4.jpg',
	'../img/img5.jpeg'
  ];
  
  // Get a reference to the body element
const body = document.querySelector('body');

// Create an image element for each image URL
const images = imageUrls.map(url => {
  const img = document.createElement('img');
  img.src = url;
  return img;
});

// Add the images to the body element
images.forEach(img => body.appendChild(img));

// Randomly position each image on the screen
images.forEach(img => {
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  img.style.position = 'absolute';
  img.width = 50 + Math.random() * 300;
  img.style.left = x + 'px';
  img.style.top = y + 'px';
});


// Move the images slowly on the page
setInterval(() => {
  images.forEach(img => {
	// Set the initial direction of the div
let dx = 1;
let dy = 1;

    // Get the current position of the div
  let x = parseInt(img.style.left);
  let y = parseInt(img.style.top);

  // Update the position of the img
  x += dx;
  y += dy;

  // Check if the img is at the edge of the screen
  const maxX = window.innerWidth - img.clientWidth;
  const maxY = window.innerHeight - img.clientHeight;
  if (x > maxX || x < 0) dx = -dx;
  if (y > maxY || y < 0) dy = -dy;

  // Set the new position of the img
  img.style.left = x + 'px';
  img.style.top = y + 'px';
  });
}, 50); // This will move the images every 50 milliseconds


