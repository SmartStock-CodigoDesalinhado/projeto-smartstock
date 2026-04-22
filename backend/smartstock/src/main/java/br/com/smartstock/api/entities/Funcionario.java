package br.com.smartstock.api.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_funcionario")
public class Funcionario {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
    @Email(message = "E-mail inválido.")
    @Size(max = 120, message = "E-mail deve ter no máximo 100 caracteres.")
    @Column(unique = true, length = 100)
    private String email;
    
    @Min(value = 8, message = "Sua senha deve conter no minímo 8 caracteres.")
    @NotBlank(message = "A senha é obrigatória.")
    private String senha;
    
    @Column(nullable = false)
    private String cargo;
    
	public Funcionario() {}
	
	public Funcionario (String email, String senha, String cargo) {
		this.email = email;
		this.senha = senha;
		this.cargo = cargo;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getCargo() {
		return cargo;
	}

	public void setCargo(String cargo) {
		this.cargo = cargo;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getSenha() {
		return senha;
	}

	public void setSenha(String senha) {
		this.senha = senha;
	}
	
	
	
}