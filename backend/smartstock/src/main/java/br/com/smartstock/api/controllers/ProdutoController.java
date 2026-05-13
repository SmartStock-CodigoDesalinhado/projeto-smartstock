package br.com.smartstock.api.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.smartstock.api.entities.Produto;
import br.com.smartstock.api.services.ProdutoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/produto")
@CrossOrigin("*")
public class ProdutoController {
	
	@Autowired
	private ProdutoService service;
	
	@GetMapping
	public ResponseEntity<List<Produto>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }
	
	 @GetMapping("/{id}")
	    public ResponseEntity<Produto> buscar(@PathVariable Long id) {
	    	Optional<Produto> prod = service.buscarPorId(id);
	    	
	    	if(prod != null) {
	    		return ResponseEntity.ok(prod.get());
	    	}
	    	
	    	return ResponseEntity.notFound().build();
	    }
	 
	 @PostMapping
	    public ResponseEntity<Produto> criar(@Valid @RequestBody Produto produto) {
	    	Produto novoProduto = service.salvar(produto);
	    	
	        return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
	    }
	 
	 @PutMapping("/{id}")
	    public ResponseEntity<Produto> atualizar(@PathVariable Long id, @Valid @RequestBody Produto prod) {
	    	Produto produtoAtualizado = service.atualizar(id, prod);
	    	
	    	if(produtoAtualizado != null) {
	    		return ResponseEntity.ok(produtoAtualizado);
	    	}
	    	
	    	return ResponseEntity.notFound().build();
	    }
	 
	 @DeleteMapping("/{id}")
	    public ResponseEntity<Object> deletar(@PathVariable Long id) {
	        Optional<Produto> produtos = service.buscarPorId(id);
	        
	        if(produtos.isPresent()) {	
	        	service.deletar(id);
	        	return ResponseEntity.status(HttpStatus.OK).body("Sucesso: O produto foi excluído permanentemente");

	        }
	    	
	    	return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Erro: Não foi possível deletar. o produto com ID" + id + "não foi encontrado");

	    }

}
