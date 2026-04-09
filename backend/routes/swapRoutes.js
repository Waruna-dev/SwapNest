import express from 'express';
const router = express.Router();
import { uploadSwapPhotos } from '../middlewares/upload.js';
import { validateSwapRequest, validateStatusUpdate } from '../middlewares/validation.js';
import {
  createSwapRequest,
  updateSwapRequest,
  updateSwapPhotos,
  getUserSwaps,
  getSwapById,
  updateSwapStatus,
  cancelSwapRequest,
  getPendingRequests,
  getAllSwaps,
  deleteSwap,
  getSwapsByItem,
  getCompletionStatus,
  requestCompletion,
} from '../controllers/swapController.js';


// console.log("getUserSwaps:", typeof getUserSwaps);
//console.log("getSwapById:", typeof getSwapById);

router.post('/', uploadSwapPhotos, validateSwapRequest, createSwapRequest);

router.put('/:id', updateSwapRequest);

router.put('/:id/photos', uploadSwapPhotos, updateSwapPhotos);
//get all swap req-admin
router.get('/all', getAllSwaps);

//get api/swaps/user/userid-both
router.get('/user/:userId', getUserSwaps);

//get api/swaps/pending/:ownerId- item owner
router.get('/pending/:ownerId', getPendingRequests);

//get-view data a specific swaps-bothh
router.get('/:id', getSwapById);
router.get('/by-item', getSwapsByItem);

router.put('/:id/status', validateStatusUpdate, updateSwapStatus);

//cancel req-requester
router.put('/:id/cancel', cancelSwapRequest);

router.delete('/:id', deleteSwap);
router.post('/:id/complete', requestCompletion);
router.get('/:id/completion-status', getCompletionStatus);

export default router;