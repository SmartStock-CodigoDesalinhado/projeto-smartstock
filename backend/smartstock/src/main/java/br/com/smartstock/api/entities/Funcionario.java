package br.com.smartstock.api.entities;

import org.hibernate.validator.constraints.br.CPF;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_funcionario")
public class Funcionario {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Pattern(regexp = "^[\\p{L}\\s]+$", message = "O nome do funcionário deve conter apenas letras e espaços.")
	@NotBlank(message ="O nome é obrigatório.")
	@Column(name = "nome_funcionario")
	private String nomeFuncionario;
	
	@NotBlank(message = "O CPF é obrigatório")
    @CPF(message = "CPF inválido") 
    @Size(min = 11, max = 14) 
    @Column(name = "cpf_funcionario", unique = true, nullable = false)
	private String cpfFuncionario;
	
	@NotBlank(message = "O RG não pode estar em branco")
    @Pattern(regexp = "^[0-9.a-zA-Z-]*$", message = "RG com formato inválido")
    @Column(name = "rg_funcionario", length = 20)
	private String rgFuncionario;
		
    @Email(message = "E-mail inválido.")
    @Size(max = 120, message = "E-mail deve ter no máximo 100 caracteres.")
    @Column(unique = true, length = 100, name = "email_funcionario")
    private String emailFuncionario;
    
    @Column(nullable = false)
    private String cargo;
    
	public Funcionario() {}
	
	public Funcionario (String emailFuncionario, String nomeFuncionario, String cargo, String rgFuncionario, String cpfFuncionario) {
		this.emailFuncionario = emailFuncionario;
		this.nomeFuncionario = nomeFuncionario;
		this.cargo = cargo;
		this.rgFuncionario = rgFuncionario;
		this.cpfFuncionario = cpfFuncionario;
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

	public String getNomeFuncionario() {
		return nomeFuncionario;
	}

	public void setNomeFuncionario(String nomeFuncionario) {
		this.nomeFuncionario = nomeFuncionario;
	}

	public String getCpfFuncionario() {
		return cpfFuncionario;
	}

	public void setCpfFuncionario(String cpfFuncionario) {
		this.cpfFuncionario = cpfFuncionario;
	}

	public String getRgFuncionario() {
		return rgFuncionario;
	}

	public void setRgFuncionario(String rgFuncionario) {
		this.rgFuncionario = rgFuncionario;
	}

	public String getEmailFuncionario() {
		return emailFuncionario;
	}

	public void setEmailFuncionario(String emailFuncionario) {
		this.emailFuncionario = emailFuncionario;
	}




	
	
	
}