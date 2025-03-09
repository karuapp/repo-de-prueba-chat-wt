import Company from "../../models/Company";
import AppError from "../../errors/AppError";

const DeleteCompanyService = async (id: string): Promise<void> => {
  const company = await Company.findOne({
    where: { id }
  });

  if(company.id === 1){
    throw new AppError("CAN_NOT_REMOVE_MASTER_COMPANY", 404);
  }

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  await company.destroy();
};

export default DeleteCompanyService;
