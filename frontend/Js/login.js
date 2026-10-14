

document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById("loginForm");
    const campoUsuario = document.getElementById("usuario");
    const campoSenha = document.getElementById("senha");

    const botaoMostrarSenha = document.getElementById("toggleSenha");
    const botaoEntrar = document.getElementById("btnEntrar");
    const mensagemLogin = document.getElementById("mensagemLogin");

    // EXIBIR OU OCULTAR SENHA

    botaoMostrarSenha.addEventListener("click", () => {

        const senhaVisivel = campoSenha.type === "text";

        campoSenha.type = senhaVisivel ? "password" : "text";

        botaoMostrarSenha.textContent = senhaVisivel
            ? "Mostrar"
            : "Ocultar";

        botaoMostrarSenha.setAttribute(
            "aria-label",
            senhaVisivel ? "Mostrar senha" : "Ocultar senha"
        );

        botaoMostrarSenha.setAttribute(
            "aria-pressed",
            String(!senhaVisivel)
        );

    });


    function exibirMensagem(texto, tipo) {

        mensagemLogin.textContent = texto;
        mensagemLogin.className = "login-message " + tipo;

    }

    // VALIDAÇÃO DO FORMULÁRIO

    formulario.addEventListener("submit", (evento) => {

        evento.preventDefault();

        const usuario = campoUsuario.value.trim();
        const senha = campoSenha.value;

        exibirMensagem("", "");

        if (usuario === "" || senha.trim() === "") {

            exibirMensagem(
                "Informe o usuário e a senha para continuar.",
                "erro"
            );

            return;
        }


        botaoEntrar.disabled = true;
        botaoEntrar.textContent = "Verificando...";

        exibirMensagem(
            "Demonstração: autenticação ainda não conectada ao servidor.",
            "sucesso"
        );

        botaoEntrar.disabled = false;
        botaoEntrar.textContent = "Entrar";

    });

});
