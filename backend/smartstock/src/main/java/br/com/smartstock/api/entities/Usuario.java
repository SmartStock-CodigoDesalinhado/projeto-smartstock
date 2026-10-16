package br.com.smartstock.api.entities;

import com.fasterxml.jackson.annotation.JsonProperty;

import br.com.smartstock.api.enums.TipoUsuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;
    
    @NotBlank(message = "O nome é obrigatório.")
    @Column(name = "nome_usuario", nullable = false, length = 100)
    private String nome;
    
    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Informe um e-mail válido.")
    @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$", message = "Informe um e-mail válido.")
    @Size(max = 50, message = "O e-mail deve ter até 50 caracteres.")
    @Column(name = "login", nullable = false, unique = true,length = 50)
    private String login;
    
    @NotBlank(message = "A senha é obrigatória.")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String senha;
    
    @NotNull(message = "O tipo de usuário é obrigatório.")
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", nullable = false)
    private TipoUsuario tipoUsuario;
    
    public Usuario () {}

    public Usuario(String nome, String login, String senha, TipoUsuario tipoUsuario) {
        this.nome = nome;
        this.login = login;
        this.senha = senha;
        this.tipoUsuario = tipoUsuario;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public TipoUsuario getTipoUsuario() {
        return tipoUsuario;
    }

    public void setTipoUsuario(TipoUsuario tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
    }
}