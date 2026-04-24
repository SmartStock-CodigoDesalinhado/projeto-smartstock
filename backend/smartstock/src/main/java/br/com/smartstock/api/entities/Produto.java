package br.com.smartstock.api.entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_produto")
public class Produto {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotBlank(message = "O nome do produto é obrigatório")
	private String nome;
	
	@NotBlank(message = "O código de barras é obrigatório")
	@Column(unique = true)
	private String codigoBarras;
	
	private LocalDate dataVencimento;
	
	@NotNull(message = "A quantidade é obrigatória.")
	@Size(min = 0, message = "A quantidade não pode ser negativa")
	private Integer quantidade;

	
	
	public Produto() {}
	
	public Produto(String nome, String codigoBarras, LocalDate dataVencimento, Integer quantidade) {
		this.nome = nome;
		this.codigoBarras = codigoBarras;
		this.dataVencimento = dataVencimento;
		this.quantidade = quantidade;
		
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

	public String getCodigoBarras() {
		return codigoBarras;
	}

	public void setCodigoBarras(String codigoBarras) {
		this.codigoBarras = codigoBarras;
	}

	public LocalDate getDataVencimento() {
		return dataVencimento;
	}

	public void setDataVencimento(LocalDate dataVencimento) {
		this.dataVencimento = dataVencimento;
	}

	public Integer getQuantidade() {
		return quantidade;
	}

	public void setQuantidade(Integer quantidade) {
		this.quantidade = quantidade;
	}
	
	
	
}
