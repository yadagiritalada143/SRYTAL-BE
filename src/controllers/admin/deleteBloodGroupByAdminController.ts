import { Request, Response } from 'express';
import deleteBloodGroupService from '../../services/admin/deleteBloodGroupByAdminService';
import { DELETE_ERROR_MESSAGES } from '../../constants/admin/manageUserMessages';

const deleteBloodGroup = (req: Request, res: Response) => {
    const { id, confirmDelete } = req.body;
    if(confirmDelete){
        deleteBloodGroupService
        .deleteBloodGroupByAdmin(id)
        .then((deleteBloodGroupResponse:any)=>{
            res.status(200).json(deleteBloodGroupResponse);
        })  
        .catch(error => {
                    console.error(`Error in deleting blood group details: ${error}`);
                    res.status(500).json({ success: false, message: DELETE_ERROR_MESSAGES.DELETE_BLOOD_GROUP_DELETE_ERROR_MESSAGE });
                });
    }
       
    }

export default { deleteBloodGroup }
// const deleteBloodGroup = async (req: Request, res: Response) => {
//     try {
//         const { id, confirmDelete } = req.body;

//         if (!confirmDelete) {
//             return res.status(400).json({ success: false, message: "Deletion not confirmed." });
//         }

//         if (!id) {
//             return res.status(400).json({ success: false, message: "User ID is required." });
//         }

//         const deleteBloodGroupResponse = await deleteBloodGroupService.deleteBloodGroupByAdmin(id);

//         if (!deleteBloodGroupResponse.success) {
//             return res.status(400).json(deleteBloodGroupResponse);
//         }

//         return res.status(200).json(deleteBloodGroupResponse);
//     } catch (error) {
//         console.error(`Error in deleting blood group details: ${error}`);
//         return res.status(500).json({ success: false, message: DELETE_ERROR_MESSAGES.DELETE_BLOOD_GROUP_DELETE_ERROR_MESSAGE });
//     }
// };

// export default { deleteBloodGroup };

