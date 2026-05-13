package br.com.smartstock.api.validation.validators;

import br.com.smartstock.api.validation.annotations.TelefoneBrasileiro;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TelefoneBrasileiroValidator implements ConstraintValidator<TelefoneBrasileiro, String>{
	
	@Override
	public boolean isValid(String valor, ConstraintValidatorContext context) {
		if(valor == null) {
			return true;
		}
		
		String regex = "^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$";
		
		return valor.matches(regex);
	}
}
