document.addEventListener("DOMContentLoaded", function () {
    const formLogin = document.getElementById("formLogin");

    if (formLogin) {
        formLogin.addEventListener("submit", function (event) {
            // Evita que a página recarregue antes de executar o script
            event.preventDefault(); 

            // Pega os dados digitados (caso queira validar no futuro)
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            console.log("Tentativa de login com:", email);

            // Redireciona pra pagina painel
            // Altere "dashboard.html" para o nome do arquivo HTML do seu painel se for diferente
            window.location.href = "dashboard.html"; 
        });
    }
});