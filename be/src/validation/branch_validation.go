package validation

type CreateBranch struct {
	Name            string `json:"name" validate:"required,max=255"`
	Slug            string `json:"slug" validate:"required,alphanumdash,max=100"`
	PicEmails       string `json:"pic_emails" validate:"omitempty,emailcsv"`
	PicPhoneNumbers string `json:"pic_phone_numbers" validate:"omitempty"`
}

type UpdateBranch struct {
	Name            string `json:"name" validate:"required,max=255"`
	Slug            string `json:"slug" validate:"required,alphanumdash,max=100"`
	PicEmails       string `json:"pic_emails" validate:"omitempty,emailcsv"`
	PicPhoneNumbers string `json:"pic_phone_numbers" validate:"omitempty"`
}
