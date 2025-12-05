package router

import (
	"app/src/controller"
	"app/src/service"

	"github.com/gofiber/fiber/v2"
)

func BranchRoutes(v1 fiber.Router, branchService service.BranchService) {
	branchController := controller.NewBranchController(branchService)

	branch := v1.Group("/branches")

	branch.Post("/", branchController.Create)         
	branch.Get("/", branchController.GetAll)          
	branch.Get("/:id", branchController.GetByID)       
	branch.Put("/:id", branchController.Update)     
	branch.Patch("/:id/deactivate", branchController.Deactivate)
	branch.Patch("/:id/activate", branchController.Activate)   
}
