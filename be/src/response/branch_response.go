package response

type BranchResponse struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Slug            string `json:"slug"`
	PicEmails       string `json:"pic_emails"`
	PicPhoneNumbers string `json:"pic_phone_numbers"`
	CreatedAt       string `json:"created_at"`
	UpdatedAt       string `json:"updated_at"`
	DeletedAt       string `json:"deleted_at,omitempty"`
	DeletedBy       string `json:"deleted_by,omitempty"`
}

type BranchListResponse struct {
	Branches []BranchResponse `json:"branches"`
}
