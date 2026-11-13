package br.com.smartstock.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.smartstock.api.entities.Fornecedor;
import br.com.smartstock.api.repositories.FornecedorRepository;
import jakarta.transaction.Transactional;

@Service
public class FornecedorService {

	@Autowired
	public FornecedorRepository repository;
	
	
	public List<Fornecedor> listarTodos() {
	    return repository.findByAtivoTrue();
	}
	
	public Optional<Fornecedor> buscarPorId(Long id) {
		return repository.findById(id)
			.filter(fornecedor -> Boolean.TRUE.equals(fornecedor.getAtivo()));
	}
	
	public Fornecedor salvar(Fornecedor forn) {
		forn.setAtivo(true);
		return repository.save(forn);
	}
	
	public Fornecedor atualizar(Long id, Fornecedor fornecedorAtualizado) {
		Optional<Fornecedor> fornecedorExistente = buscarPorId(id);
		
		if(fornecedorExistente.isPresent()) {
			Fornecedor atualizado = fornecedorExistente.get();
		
			atualizado.setNomeFornecedor(fornecedorAtualizado.getNomeFornecedor());
			atualizado.setEmailFornecedor(fornecedorAtualizado.getEmailFornecedor());
			atualizado.setTelefoneComercial(fornecedorAtualizado.getTelefoneComercial());
			atualizado.setLogradouroComercio(fornecedorAtualizado.getLogradouroComercio());
			atualizado.setCnpj(fornecedorAtualizado.getCnpj());
			
			return repository.save(atualizado);
		}
		
		return null;
	}
	


	@Transactional
	public boolean deletar(Long id) {

    	Optional<Fornecedor> fornecedor = repository.findById(id);

    	if (fornecedor.isEmpty()) {
    		return false;
    	}

    	repository.delete(fornecedor.get());
    	repository.flush();

    	return true;
	}


}