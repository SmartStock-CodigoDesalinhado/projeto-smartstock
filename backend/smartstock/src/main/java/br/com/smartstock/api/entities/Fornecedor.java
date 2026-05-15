package br.com.smartstock.api.entities;

import java.util.List;

import org.hibernate.validator.constraints.br.CNPJ;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_fornecedores")
public class Fornecedor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotBlank(message = "O nome é obrigatório")
	@Pattern(regexp = "^[\\p{L} ]+$", message = "O nome deve conter apenas letras e espaços.")
	private String nome;
	
	@Email(message = "E-mail inválido.")
	@Size(max = 120, message = "E-mail deve ter no máximo 120 caracteres.")
    @Column(unique = true, length = 120)
	private String email;
	
	@Column(length = 20, unique = true)
	@NotBlank(message = "O telefone é obrigatório")
	private String telefoneComercial;
	
	@NotBlank(message = "O logradouro é obrigatório")
	@Size(min = 3, max = 150, message = "O logradouro deve ter entre 3 e 150 caracteres")
	private String logradouroComercio;
	
	@NotBlank
    @CNPJ 
    @Column(unique = true)
    private String cnpj;
	
	@OneToMany(mappedBy = "fornecedor")
    private List<Produto> produtos;
	
	
	public Fornecedor () {}
	
	
	public Fornecedor(String nome, String email, String telefoneComercial, String logradouroComercio, String cnpj) {
		this.nome = nome;
		this.email = email;
		this.telefoneComercial = telefoneComercial;
		this.logradouroComercio = logradouroComercio;
		this.cnpj = cnpj;
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



	public String getEmail() {
		return email;
	}



	public void setEmail(String email) {
		this.email = email;
	}



	public String getTelefoneComercial() {
		return telefoneComercial;
	}



	public void setTelefoneComercial(String telefoneComercial) {
		this.telefoneComercial = telefoneComercial;
	}



	public String getLogradouroComercio() {
		return logradouroComercio;
	}



	public void setLogradouroComercio(String logradouroComercio) {
		this.logradouroComercio = logradouroComercio;
	}


	public String getCnpj() {
		return cnpj;
	}


	public void setCnpj(String cnpj) {
		this.cnpj = cnpj;
	}



	
	
}


