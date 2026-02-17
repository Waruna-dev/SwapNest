const{body,validationResult}=require('express-validator');

//rules for creating a swap req
const validateSwapRequest=[
    body('postId').notEmpty().withMessage('PostId is required').isMongoId().withMessage('Invalid post Id'),
    body('requesterId').notEmpty().withMessage('RequesterId is required').isMongoId().withMessage('Invalid requester Id'),
    body('requesterName').notEmpty().withMessage('Requester name is required').isString().withMessage('requeester Name must be a string'),
    body('swapType').notEmpty().withMessage('Swap Type is required').isIn(['item-for-item','swap-with-cash']).withMessage('Invalid Swap Type'),
    body('offeredItem')
        .if(body('swapType').equals('item-for-item'))
        .notEmpty().withMessage('Offered item is required for item-for-item swap'),
    body('offeredItem.name')
        .if(body('swapType').equals('item-for-item'))
        .notEmpty().withMessage('offered item name is required'),
    body('offeredItem.condition')
        .if(body('swapType').equals('item-for-item'))
        .notEmpty().withMessage('offered item condition is required')
        .isIn(['Like New','Good','Fair','Poor']).withMessage('Invalid Condition'),
    body('cashDetails.amount')
        .if(body('swapType').equals('swap-with-cash'))
        .notEmpty().withMessage('Offered item is required')
        .isNumeric().withMessage('cash amount is required for swap with cash')
        .isFloat({min:0}).withMessage('cash amount must be positive'),
    body('cashDetails.whoPays')
        .if(body('swapType').equals('swap-with-cash'))
        .notEmpty().withMessage('') //like change 
        .isIn(['i-pay-owner','owner-pays-me']).withMessage('Invalid payment option'),
    body('messageToOwner')
        .optional()
        .isString().withMessage('Message must be a string')
        .isLength({max:500}).withMessage('YMessage cannot exceed 500 characters'),
    body('agreementAccepted')
        .notEmpty().withMessage('You must accept the agreement')
        .isBoolean().withMessage('Agreement must be boolen')
        .custom(value=>value===true).withMessage('You must accept the agreement terms'),
    (req,res,next)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({success:false,errors:errors.array()});
        }
        next();   //------

    }

]