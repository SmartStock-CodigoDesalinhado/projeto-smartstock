package br.com.smartstock.api.services;

import java.util.Optional;

import org.springframework.stereotype.Service;

import br.com.smartstock.api.entities.Fornecedor;
import br.com.smartstock.api.repositories.FornecedorRepository;

@Service
public class FornecedorService {

	public FornecedorRepository repository;
	
	public Optional<Fornecedor> buscarPorId(Long id) {
		return repository.findById(id);
	}
	
	public Fornecedor salvar(Fornecedor forn) {
		return repository.save(forn);
	}
	
	public Fornecedor atualizar(Long id, Fornecedor fornecedorAtualizado) {
		Optional<Fornecedor> fornecedorExistente = buscarPorId(id);
		
		if(fornecedorExistente.isPresent()) {
			Fornecedor atualizado = fornecedorExistente.get();
		
			atualizado.setNome(fornecedorAtualizado.getNome());
			atualizado.setEmail(fornecedorAtualizado.getEmail());
			atualizado.setSenha(fornecedorAtualizado.getSenha());
			atualizado.setTelefoneComercial(fornecedorAtualizado.getTelefoneComercial());
			atualizado.setLogradouroComercio(fornecedorAtualizado.getLogradouroComercio());
			
			return repository.save(atualizado);
		}
		
		return null;
	}
	
	public void deletar(Long id) {
		repository.deleteById(id);
	}
}