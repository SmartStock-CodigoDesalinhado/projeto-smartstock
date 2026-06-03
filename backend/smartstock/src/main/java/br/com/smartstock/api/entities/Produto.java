package br.com.smartstock.api.entities;

import java.math.BigDecimal;
import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tb_produto")
public class Produto {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotBlank(message = "O nome do produto é obrigatório")
	@Size(min = 3, max = 100)
	@Column(nullable = false)
	private String nome;
	
	@NotBlank(message = "O código de barras é obrigatório")
	@Column(unique = true, nullable = false)
	private String codigoBarras;
	
	@NotNull(message = "O preço é obrigatório.")
	@PositiveOrZero
	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal precoVenda;
	
	@NotNull(message = "A data de validade deve ser uma data futura.")
	private Date dataVencimento;
	
	@NotNull(message = "A quantidade é obrigatória.")
	@PositiveOrZero(message = "A quantidade não pode ser negativa.")
	private Integer unidade;
	
	@ManyToOne
    @JoinColumn(name = "fornecedor_id") 
    private Fornecedor fornecedor;
	
	@ManyToOne
	@JoinColumn(name = "id_categoria")
	private Categoria categoria;

	public Produto() {}
	
	public Produto(String nome, String codigoBarras, BigDecimal precoVenda, Date dataVencimento, Integer unidade) {
		this.nome = nome;
		this.codigoBarras = codigoBarras;
		this.dataVencimento = dataVencimento;
		this.unidade = unidade;
		this.precoVenda = precoVenda;
		
	}

	public BigDecimal getPrecoVenda() {
		return precoVenda;
	}

	public void setPrecoVenda(BigDecimal precoVenda) {
		this.precoVenda = precoVenda;
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

	public Date getDataVencimento() {
		return dataVencimento;
	}

	public void setDataVencimento(Date dataVencimento) {
		this.dataVencimento = dataVencimento;
	}

	public Integer getUnidade() {
		return unidade;
	}

	public void setUnidade(Integer unidade) {
		this.unidade = unidade;
	}
	
	
	
	
}
