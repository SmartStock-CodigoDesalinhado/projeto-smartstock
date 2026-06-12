document.addEventListener("DOMContentLoaded", () => {
    const botaoLogin = document.querySelector(".login-btn");

    if (botaoLogin) {
        botaoLogin.addEventListener("click", (evento) => {
        
            evento.preventDefault(); 
            
            console.log("Botão de login clicado. Redirecionando...");
            alert("Redirecionando para a tela de autenticação do SmartStock...");
      
        });
    }
});

/*  2. ANIMAÇÃO DE REVELAÇÃO AO ROLAR A PÁGINA (SCROLL REVEAL)*/
const iniciarAnimacaoScroll = () => {
    const elementosParaAnimar = document.querySelectorAll('.middle-block, .text-block, .hero-image-box');

    elementosParaAnimar.forEach(elemento => {
        elemento.style.opacity = "0";
        elemento.style.transform = "translateY(30px)";
        elemento.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
    });

    const observador = new IntersectionObserver((entradas, observador) => {
        entradas.forEach(entrada => {
         
            if (entrada.isIntersecting) {
                const elemento = entrada.target;
                elemento.style.opacity = "1";
                elemento.style.transform = "translateY(0)";
                observador.unobserve(elemento); 
            }
        });
    }, {
        threshold: 0.15 
    });

    elementosParaAnimar.forEach(elemento => observador.observe(elemento));
};