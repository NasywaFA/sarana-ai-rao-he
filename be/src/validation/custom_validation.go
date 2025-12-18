package validation

import (
	"regexp"

	"github.com/go-playground/validator/v10"
)

func Password(field validator.FieldLevel) bool {
	value, ok := field.Field().Interface().(string)
	if ok {
		hasDigit := regexp.MustCompile(`[0-9]`).MatchString(value)
		hasLetter := regexp.MustCompile(`[a-zA-Z]`).MatchString(value)

		if !hasDigit || !hasLetter {
			return false
		}
	}

	return true
}

func AlphanumDash(field validator.FieldLevel) bool {
	value := field.Field().String()

	regex := regexp.MustCompile(`^[a-zA-Z0-9-]+$`)

	return regex.MatchString(value)
}

func (r *TransferItem) Validate() error {
	validate := validator.New()
	
	validate.RegisterValidation("nefield", func(fl validator.FieldLevel) bool {
		field := fl.Field().String()
		param := fl.Parent().FieldByName(fl.Param()).String()
		return field != param
	})
	
	if err := validate.Struct(r); err != nil {
		return err
	}
	
	return nil
}

