package response

import (
	"time"
	"app/src/model"
)

type Tokens struct {
	Access  TokenExpires `json:"access"`
	Refresh TokenExpires `json:"refresh"`
}

type TokenExpires struct {
	Token   string    `json:"token"`
	Expires time.Time `json:"expires"`
}

type RefreshToken struct {
	Code   int    `json:"code"`
	Status string `json:"status"`
	Tokens Tokens `json:"tokens"`
}

type LoginResponse struct {
    User         *model.User 	   	     `json:"user"`
    ActiveBranch *ActiveBranchResponse   `json:"active_branch"`
	Tokens		  Tokens 	  			 `json:"tokens"`
}

type ActiveBranchResponse struct {
    ID   string `json:"id"`
    Name string `json:"name"`
}
