package br.com.smartstock.api.config;

import br.com.smartstock.api.repositories.UsuarioRepository;

import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public UserDetailsService userDetailsService(UsuarioRepository repository) {
        return email -> repository.findByLoginIgnoreCase(email)
            .map(usuario -> User.withUsername(usuario.getLogin())
                .password(usuario.getSenha())
                .roles(usuario.getTipoUsuario().name())
                .build())
            .orElseThrow(() -> new UsernameNotFoundException("Credenciais invalidas."));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .cors(Customizer.withDefaults())
            .csrf(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/usuarios/ceo-inicial/disponibilidade").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/usuarios/ceo-inicial").permitAll()   
                .requestMatchers(HttpMethod.GET, "/api/usuarios/csrf").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/usuarios/me").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/usuarios/ceos").hasRole("CEO")
                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("CEO")
                .requestMatchers("/api/usuarios", "/api/usuarios/**").hasAnyRole("ADMIN", "CEO")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .usernameParameter("email")
                .passwordParameter("password")
                .successHandler((request, response, authentication) -> {
                    response.setStatus(200);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"autenticado\":true}");
                })
                .failureHandler((request, response, exception) -> {
                    response.setStatus(401);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"mensagem\":\"E-mail ou senha invalidos.\"}");
                })
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(200);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"sessaoEncerrada\":true}");
                })
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(401);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"mensagem\":\"Autenticacao necessaria.\"}");
                })
                .accessDeniedHandler((request, response, exception) -> {
                    response.setStatus(403);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"mensagem\":\"Acesso negado.\"}");
                })
            )
            .httpBasic(basic -> basic.disable())
            .build();
    }
}
