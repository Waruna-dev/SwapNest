const express=require('express');
const router=express.Router();
const {uploadSwapPhotos}=require('../middleware/upload');
const {validateSwapRequest,validateStatusUpdate}=require('../middleware/validation');
const{
    createSwapRequest,
    getUserSwaps,
    getSwapById,
    updateSwapStatus,
    cancelSwapRequest,
    getPendingRequests,
    getAllSwaps
}=require('../controllers/swapController');

//POST api/swaps - check again-requester
router.post('/', uploadSwapPhotos, validateSwapRequest,createSwapRequest);      // First handle file upload,// Then validate

//get all swap req-admin
router.get('/all',getAllSwaps);

//get api/swaps/user/userid-both
router.get('/user/:userId',getUserSwaps);  //check with user model

//get api/swaps/pending/:ownerId- item owner
router.get('/pending/:ownerId',getPendingRequests);

//get-view data a specific swaps-bothh
router.get('/:id',getSwapById);

//put accept or reject req-item owner
router.put('/:id/status',validateStatusUpdate,updateSwapStatus);

//cancel req-requester
router.put('/:id/cancel',cancelSwapRequest);