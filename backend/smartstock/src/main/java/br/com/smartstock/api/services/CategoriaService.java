package br.com.smartstock.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.smartstock.api.entities.Categoria;
import br.com.smartstock.api.repositories.CategoriaRepository;

@Service
public class CategoriaService {
	
	@Autowired
	private CategoriaRepository repository;
	
	public List<Categoria> listarTodos() {
		return repository.findAll();
	}
	
	public Categoria salvar(Categoria categoria) {
		return repository.save(categoria);
	}
	
	public Optional<Categoria> buscarporId (Long id) {
		return repository.findById(id);
	}
	
	public Categoria atualizar(Long id, Categoria catAlterada) {
		Optional<Categoria> catExistente = buscarPorId(id);
		
		id
	}

}
