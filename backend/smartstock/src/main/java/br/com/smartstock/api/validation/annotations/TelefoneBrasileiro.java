package br.com.smartstock.api.validation.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import br.com.smartstock.api.validation.validators.TelefoneBrasileiroValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;



@Documented
@Constraint(validatedBy = TelefoneBrasileiroValidator.class)
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)

public @interface TelefoneBrasileiro {
	
	String message() default "Telefone inválido.";
	
	Class<?>[] groups() default{};
	
	//Herança de algumas validaçoes proprias
	Class<? extends Payload>[] payload() default{};
}
