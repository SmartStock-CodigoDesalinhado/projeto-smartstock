package br.com.smartstock.api.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.smartstock.api.entities.Cliente;
import br.com.smartstock.api.repositories.ClienteRepository;

@Service
public class ClienteService {

	@Autowired
	private ClienteRepository repository;
	
	public List<Cliente> listarTodos() {
        return repository.findAll();
    }
	
	public Optional<Cliente> buscarPorId(Long id) {
		return repository.findById(id);
	}
	
	public Cliente salvar(Cliente cl) {
		return repository.save(cl);
	}
	
	public Cliente atualizar(Long id, Cliente clienteAtualizado) {
		Optional<Cliente> clienteExistente = buscarPorId(id);
		
		if(clienteExistente.isPresent()) {
			Cliente atualizado = clienteExistente.get();
		
			atualizado.setNomeCliente(clienteAtualizado.getNomeCliente());		
			atualizado.setEmailCliente(clienteAtualizado.getEmailCliente());
			atualizado.setTelefoneCelular(clienteAtualizado.getTelefoneCelular());
			
			return repository.save(atualizado);
		}
		
		return null;
	}
	
	public void deletar(Long id) {
		repository.deleteById(id);
	}
	

}
