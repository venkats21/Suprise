let highestZ = 1;
let currentAudio = null; // To track currently playing audio

class Paper {
  holdingPaper = false;
  mouseTouchX = 0;
  mouseTouchY = 0;
  mouseX = 0;
  mouseY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;
  draggedOut = false; // To check if fully dragged out
  belowCard = null;   // To track the card immediately below

  init(paper) {
    document.addEventListener('mousemove', (e) => {
      if (!this.rotating) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        this.velX = this.mouseX - this.prevMouseX;
        this.velY = this.mouseY - this.prevMouseY;
      }

      // Calculate direction and angle
      const dirX = e.clientX - this.mouseTouchX;
      const dirY = e.clientY - this.mouseTouchY;
      const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;

      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = (180 * angle) / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;
      if (this.rotating) {
        this.rotation = degrees;
      }

      if (this.holdingPaper) {
        if (!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;

        // Update the card's position
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px)`;

        // Check if dragged out of the card below
        if (this.belowCard) {
          const paperRect = paper.getBoundingClientRect();
          const belowCardRect = this.belowCard.getBoundingClientRect();

          // Check for overlap
          if (!isOverlapping(paperRect, belowCardRect) && !this.draggedOut) {
            this.draggedOut = true; // Mark as fully dragged out
            playMusic(paper); // Play music for this card
          }
        }
      }
    });

    paper.addEventListener('mousedown', (e) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;

      paper.style.zIndex = highestZ;
      highestZ += 1;

      if (e.button === 0) {
        this.mouseTouchX = this.mouseX;
        this.mouseTouchY = this.mouseY;
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
      }
      if (e.button === 2) {
        this.rotating = true;
      }

      // Find the card immediately below the current one
      this.belowCard = findBelowCard(paper);
    });

    window.addEventListener('mouseup', () => {
      this.holdingPaper = false;
      this.rotating = false;
      this.draggedOut = false; // Reset dragged out status
    });
  }
}

// Function to check if two rectangles overlap
function isOverlapping(rect1, rect2) {
  return !(rect1.right < rect2.left || 
           rect1.left > rect2.right || 
           rect1.bottom < rect2.top || 
           rect1.top > rect2.bottom);
}

// Function to play music associated with a paper
function playMusic(paper) {
  const audioFile = paper.getAttribute('data-audio'); // Get the audio file path from the data-audio attribute
  if (audioFile) {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0; // Reset to the beginning
    }
    // Play the new audio
    currentAudio = new Audio(audioFile);
    currentAudio.play();
  }
}

// Function to find the card directly below the dragged card
function findBelowCard(paper) {
  const paperRect = paper.getBoundingClientRect();
  const allPapers = Array.from(document.querySelectorAll('.paper'));

  // Find the first paper that overlaps the dragged paper
  for (const otherPaper of allPapers) {
    if (otherPaper !== paper) {
      const otherRect = otherPaper.getBoundingClientRect();
      if (isOverlapping(paperRect, otherRect)) {
        return otherPaper; // Return the first overlapping card
      }
    }
  }
  return null; // No card below
}

// Initialize all papers
const papers = Array.from(document.querySelectorAll('.paper'));
papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});
