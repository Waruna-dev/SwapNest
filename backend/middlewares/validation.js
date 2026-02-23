import { body, validationResult } from 'express-validator';

// rules for creating a swap req
export const validateSwapRequest = [
    body('itemId')
        .notEmpty().withMessage('Item ID is required')
        .isMongoId().withMessage('Invalid item ID format'),
    
    body('requesterId')
        .notEmpty().withMessage('Requester ID is required')
        .isMongoId().withMessage('Invalid requester ID format'),
    
    body('requesterName')
        .notEmpty().withMessage('Requester name is required')
        .isString().withMessage('Requester name must be a string'),
    
    body('swapType')
        .notEmpty().withMessage('Swap type is required')
        .isIn(['item-for-item', 'swap-with-cash']).withMessage('Invalid swap type'),
    
    body('offeredItem')
        .if(body('swapType').equals('item-for-item'))
        .notEmpty().withMessage('Offered item is required for item-for-item swap'),
    
    body('offeredItem.name')
        .if(body('swapType').equals('item-for-item'))
        .notEmpty().withMessage('Offered item name is required'),
    
    body('offeredItem.condition')
        .if(body('swapType').equals('item-for-item'))
        .notEmpty().withMessage('Offered item condition is required')
        .isIn(['Like New', 'Good', 'Fair', 'Poor']).withMessage('Invalid condition'),
    
    body('cashDetails.amount')
        .if(body('swapType').equals('swap-with-cash'))
        .notEmpty().withMessage('Cash amount is required for swap with cash')
        .isNumeric().withMessage('Cash amount must be a number')
        .isFloat({ min: 0 }).withMessage('Cash amount must be positive'),
    
    body('cashDetails.whoPays')
        .if(body('swapType').equals('swap-with-cash'))
        .notEmpty().withMessage('Who pays option is required')
        .isIn(['i-pay-owner', 'owner-pays-me']).withMessage('Invalid payment option'),
    
    body('messageToOwner')
        .optional()
        .isString().withMessage('Message must be a string')
        .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
    
    body('agreementAccepted')
        .notEmpty().withMessage('You must accept the agreement')
        .isBoolean().withMessage('Agreement must be a boolean')
        .custom(value => value === true).withMessage('You must accept the agreement terms'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

// Validation for status update
export const validateStatusUpdate = [
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['accepted', 'rejected', 'completed', 'cancelled']).withMessage('Invalid status'),
    
    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
        .isLength({ max: 300 }).withMessage('Notes cannot exceed 300 characters'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];
