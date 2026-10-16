
/* ==========================================
   SMARTSTOCK — JAVASCRIPT PRINCIPAL
   LOGIN COM E-MAIL E SENHA
========================================== */

(() => {

    'use strict';

    // ELEMENTOS DA PÁGINA

    const form = document.getElementById('login-form');

    const email = document.getElementById('email');

    const password = document.getElementById('password');

    const togglePassword = document.getElementById('toggle-password');

    const formMessage = document.getElementById('form-message');


    // ======================================
    // EXIBIR ERROS
    // ======================================

    function setFieldError(input, message) {

        const error = document.getElementById(
            `${input.id}-error`
        );

        error.textContent = message;

        if (message) {
            input.setAttribute('aria-invalid', 'true');
        } else {
            input.removeAttribute('aria-invalid');
        }

    }


    // ======================================
    // EXIBIR MENSAGEM GERAL
    // ======================================

    function showMessage(text, kind) {

        formMessage.textContent = text;

        formMessage.dataset.kind = kind;

        formMessage.hidden = !text;

        formMessage.setAttribute(
            'role',
            kind === 'error' ? 'alert' : 'status'
        );

    }


    // ======================================
    // LIMPAR ERROS AO DIGITAR
    // ======================================

    form.addEventListener('input', (event) => {

        if (
            event.target === email ||
            event.target === password
        ) {

            setFieldError(event.target, '');

            showMessage('', '');

        }

    });


    // ======================================
    // MOSTRAR OU OCULTAR SENHA
    // ======================================

    togglePassword.addEventListener('click', () => {

        const isVisible = password.type === 'password';

        password.type = isVisible
            ? 'text'
            : 'password';

        togglePassword.setAttribute(
            'aria-pressed',
            String(isVisible)
        );

        togglePassword.setAttribute(
            'aria-label',
            isVisible ? 'Ocultar senha' : 'Mostrar senha'
        );

        togglePassword.title = isVisible
            ? 'Ocultar senha'
            : 'Mostrar senha';

        password.focus();

    });


    // ======================================
    // ENVIO DO FORMULÁRIO
    // ======================================

    form.addEventListener('submit', (event) => {

        event.preventDefault();

        showMessage('', '');

        // CONTEÚDO DOS CAMPOS

        const emailValue = email.value.trim();

        const missingEmail = emailValue.length === 0;

        const missingPassword =
            password.value.trim().length === 0;


        // ==================================
        // VERIFICAR FORMATO DO E-MAIL
        // ==================================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        const invalidEmail =
            !missingEmail &&
            (
                !email.checkValidity() ||
                !emailPattern.test(emailValue)
            );


        // ==================================
        // VALIDAR E-MAIL
        // ==================================

        if (missingEmail) {

            setFieldError(
                email,
                'Informe seu e-mail.'
            );

        } else if (invalidEmail) {

            setFieldError(
                email,
                'Informe um e-mail válido.'
            );

        } else {

            setFieldError(email, '');

        }


        // ==================================
        // VALIDAR SENHA
        // ==================================

        setFieldError(
            password,
            missingPassword
                ? 'Informe sua senha.'
                : ''
        );


        // ==================================
        // IMPEDIR DADOS INVÁLIDOS
        // ==================================

        if (
            missingEmail ||
            invalidEmail ||
            missingPassword
        ) {

            const message = invalidEmail
                ? 'Revise o formato do e-mail.'
                : 'Preencha e-mail e senha para continuar.';

            showMessage(
                message,
                'error'
            );

            // Foco no primeiro campo inválido

            if (missingEmail || invalidEmail) {

                email.focus();

            } else {

                password.focus();

            }

            return;

        }


        // ==================================
        // AUTENTICAÇÃO COM SPRING BOOT
        // ==================================

        // O formato do e-mail e os campos
        // obrigatórios foram validados.
        //
        // Isso não significa que o usuário
        // foi autenticado.
        //
        // A autenticação real será
        // implementada com a API Spring Boot.

        showMessage(
            'Formulário validado. O acesso estará disponível após a integração da autenticação com o backend.',
            'info'
        );

    });

})();
