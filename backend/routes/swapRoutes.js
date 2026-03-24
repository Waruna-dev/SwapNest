import express from 'express';
const router = express.Router();
import { uploadSwapPhotos } from '../middlewares/upload.js';
import { validateSwapRequest, validateStatusUpdate } from '../middlewares/validation.js';
import {
  createSwapRequest,
  getUserSwaps,
  getSwapById,
  updateSwapStatus,
  cancelSwapRequest,
  getPendingRequests,
  getAllSwaps,
  deleteSwap
} from '../controllers/swapController.js';


// console.log("getUserSwaps:", typeof getUserSwaps);
//console.log("getSwapById:", typeof getSwapById);

router.post('/', uploadSwapPhotos, validateSwapRequest, createSwapRequest);

//get all swap req-admin
router.get('/all', getAllSwaps);

//get api/swaps/user/userid-both
router.get('/user/:userId', getUserSwaps);

//get api/swaps/pending/:ownerId- item owner
router.get('/pending/:ownerId', getPendingRequests);

//get-view data a specific swaps-bothh
router.get('/:id', getSwapById);

//put accept or reject req-item owner
router.put('/:id/status', validateStatusUpdate, updateSwapStatus);

//cancel req-requester
router.put('/:id/cancel', cancelSwapRequest);

router.delete('/:id', deleteSwap);

export default router;