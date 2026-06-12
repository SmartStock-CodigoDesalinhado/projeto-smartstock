	package br.com.smartstock.api.entities;
	
	
	import br.com.smartstock.api.validation.annotations.TelefoneBrasileiro;
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
	@Table(name = "tb_cliente")
	public class Cliente {
		
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
		private Long id;
		
		@NotBlank(message = "O nome é obrigatório")
		@Pattern(regexp = "^[\\p{L}\\s]+$", message = "O nome do cliente deve conter apenas letras e espaços.")
		@Column(name = "nome_cliente")
		private String nomeCliente;
		
		@TelefoneBrasileiro(message = "Telefone deve estar no padrão brasileiro.")
		@Column(length = 20, unique = true, name = "telefone_celular")
		@NotBlank(message = "O telefone é obrigatório")
		private String telefoneCelular;
		
		@Email(message = "E-mail inválido.")
		@Size(max = 120, message = "E-mail deve ter no máximo 120 caracteres.")
	    @Column(unique = true, length = 120, name = "email_cliente")
		private String emailCliente;
		
		
		public Cliente() {}
		
		public Cliente (String nomeCliente, String telefoneCelular, String telefoneComercial, String emailCliente) {
			this.nomeCliente = nomeCliente;
			this.telefoneCelular = telefoneCelular;
			this.emailCliente = emailCliente;
		}
	
		public Long getId() {
			return id;
		}
	
	
	
		
	
		public void setId(Long id) {
			this.id = id;
		}
	
		public String getNomeCliente() {
			return nomeCliente;
		}
	
		public void setNomeCliente(String nomeCliente) {
			this.nomeCliente = nomeCliente;
		}
	
		public String getTelefoneCelular() {
			return telefoneCelular;
		}
	
		public void setTelefoneCelular(String telefoneCelular) {
			this.telefoneCelular = telefoneCelular;
		}
	
		public String getEmailCliente() {
			return emailCliente;
		}
	
		public void setEmailCliente(String emailCliente) {
			this.emailCliente = emailCliente;
		}
	
	
		
		
		
	}
