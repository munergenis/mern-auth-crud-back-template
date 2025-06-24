import { UNAUTHORIZED, OK, NOT_FOUND } from '../../../lib/constants/http';
import appAssert from '../../../lib/utils/appAssert';
import catchErrors from '../../../lib/utils/catchErrors';
import UserModel from '../models/user.model';

export const getUserHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, 'Not Authorized');

  const user = await UserModel.findById(userId);
  appAssert(user, NOT_FOUND, 'User not found');

  res.status(OK).json(user.omitPassword());
  return;
});
