const imagensCarrossel = [
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80", 
    "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=400&q=80", 
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80"  
];

let indiceAtual = 0;


const imagemElemento = document.querySelector('.carousel-image');
const botoesSeta = document.querySelectorAll('.carousel-arrow');


const botaoVoltar = botoesSeta[0];
const botaoAvancar = botoesSeta[1];


function atualizarImagem(indice) {
    
    imagemElemento.style.opacity = 0.3;
    
    setTimeout(() => {
        imagemElemento.src = imagensCarrossel[indice];
        imagemElemento.style.opacity = 1;
    }, 150);
}


botaoVoltar.addEventListener('click', () => {
    indiceAtual--;
    if (indiceAtual < 0) {
        indiceAtual = imagensCarrossel.length - 1; 
    }
    atualizarImagem(indiceAtual);
});


botaoAvancar.addEventListener('click', () => {
    indiceAtual++;
    if (indiceAtual >= imagensCarrossel.length) {
        indiceAtual = 0; 
    }
    atualizarImagem(indiceAtual);
});




const formulario = document.querySelector('.login-form');
const campoEmail = document.getElementById('email');
const campoSenha = document.getElementById('password');
const botaoGoogle = document.querySelector('.btn-google');


formulario.addEventListener('submit', (evento) => {
    evento.preventDefault(); 

    const email = campoEmail.value.trim();
    const senha = campoSenha.value.trim();

   
    if (!email || !senha) {
        alert("Por favor, preencha todos os campos antes de acessar!");
        return;
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Por favor, insira um e-mail válido.");
        return;
    }

   
    console.log("Tentativa de login enviada com sucesso:", { email });
    alert(`Acessando a conta com o e-mail: ${email}`);
    
  
});


botaoGoogle.addEventListener('click', () => {
    
    console.log("Autenticação via Google iniciada.");
    alert("Redirecionando para o serviço de autenticação do Google...");
});