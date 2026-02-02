import { Request, Response } from 'express';
import updateAppWalkThroughService from '../../services/common/updateAppWalkThroughService';
import { APPLICATION_WALK_THROUGH_ERROR_MESSAGE } from '../../constants/commonErrorMessages';

const updateApplicationWalkThrough = (req: Request, res: Response) => {
    updateAppWalkThroughService
        .updateAppWalkThrough(req.body)
        .then((responseAfterUpdate: any) => {
            res.status(200).json({ success: true });
        })
        .catch((error: any) => {
            console.error(`Error occured in Controller layer: ${error}`);
            res.status(401).json({ success: false, message: APPLICATION_WALK_THROUGH_ERROR_MESSAGE.UPDATE_APP_WALK_THROUGH_ERROR })
        });
}

export default { updateApplicationWalkThrough }
