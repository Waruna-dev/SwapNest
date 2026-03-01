import { body, validationResult } from 'express-validator';

export const validateSwapRequest = [
    body('itemId')
        .notEmpty().withMessage('Item ID is required')
        .isString().withMessage('Invalid item ID'),
    
    body('requesterId')
        .notEmpty().withMessage('Requester ID is required')
        .isString().withMessage('Invalid requester ID'),
     
    body('requesterName')
        .notEmpty().withMessage('Requester name is required')
        .isString().withMessage('Requester name must be a string'),
    
    body('swapType')
        .notEmpty().withMessage('Swap type is required')
        .isIn(['item-for-item', 'swap-with-cash']).withMessage('Invalid swap type'),
    
    body('cashDetails.amount')
        .if(body('swapType').equals('swap-with-cash'))
        .optional()
        .custom(value => {
            const num = parseFloat(value);
            if (isNaN(num) || num < 0) {
                throw new Error('Cash amount must be a positive number');
            }
            return true;
        }),
    
    body('cashDetails.whoPays')
        .if(body('swapType').equals('swap-with-cash'))
        .optional()
        .isIn(['i-pay-owner', 'owner-pays-me']).withMessage('Invalid payment option'),
    
    body('offeredItem.name')
        .if(body('swapType').equals('item-for-item'))
        .optional()
        .isString(),
    
    body('offeredItem.condition')
        .if(body('swapType').equals('item-for-item'))
        .optional()
        .isIn(['Like New', 'Good', 'Fair', 'Poor']),
    
    body('agreementAccepted')
        .notEmpty().withMessage('You must accept the agreement')
        .custom(value => {
            const accepted= value === true || value === 'true' || value === '1';
            if (!accepted) {
                throw new Error('You must accept the agreement terms');
            }
            return true;
        }),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

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