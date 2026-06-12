
const images = [
    "https://images.unsplash.com/photo-1586528116311-ad8ed7c1590f?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=600&auto=format&fit=crop"
];

let currentIndex = 0;

const carouselImg = document.getElementById("carouselImage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const btnLogin = document.getElementById("btnLogin");

function updateImage() {
    
    carouselImg.style.opacity = 0.5;
    
    setTimeout(() => {
        carouselImg.src = images[currentIndex];
        carouselImg.style.opacity = 1;
    }, 150);
}


prevBtn.addEventListener("click", () => {
    if (currentIndex === 0) {
        currentIndex = images.length - 1; 
    } else {
        currentIndex--;
    }
    updateImage();
});


nextBtn.addEventListener("click", () => {
    if (currentIndex === images.length - 1) {
        currentIndex = 0; 
    } else {
        currentIndex++;
    }
    updateImage();
});


document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Formulário enviado!');
});