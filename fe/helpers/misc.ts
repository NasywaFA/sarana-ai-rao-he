import { getBranchById, getCurrentBranch } from "@/services/branchesService";

export const getBranchData = async () => {
  const response = await getCurrentBranch();
  if (response.isSuccess) {
    const branch = await getBranchById(response.data!);
    if (branch.isSuccess) {
      return branch.data!;
    }
  }
  return null;
}