import Swap from "../models/Swap.js";
import Item from "../models/Item.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

const createNotification = async (userId, type, title, message, swapId = null, itemId = null, metadata = {}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      swapId,
      itemId,
      metadata,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

const createSwapRequest = async (req, res) => {
  try {
    const {
      itemId,
      requesterId,
      requesterName,
      swapType,
      offeredItem,
      cashDetails,
      messageToOwner,
      agreementAccepted,
    } = req.body;

    // Validate required fields
    if (!itemId || !requesterId || !requesterName || !swapType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    
    if (!item.isActive) return res.status(400).json({ success: false, message: "Item not available" });
    
    if (item.ownerId.toString() === requesterId) {
      return res.status(400).json({ success: false, message: "Cannot swap your own item" });
    }

    // Mode check - SELL items only allow cash
    if (item.mode === "SELL" && swapType !== "swap-with-cash") {
      return res.status(400).json({ 
        success: false, 
        message: "This item is for sale only. Please use swap-with-cash." 
      });
    }

    let ownerName = "Unknown";
    let owner = null;
    try {
      owner = await User.findById(item.ownerId);
      if (owner) ownerName = owner.username;
    } catch (userError) {
      console.log("User lookup failed, using default name");
    }

    // Process photos
    const photos = req.files?.map((file) => ({
      url: `/uploads/swaps/${file.filename}`,
      filename: file.filename,
    })) || [];

    const requestedItem = {
      itemId: item._id,
      name: item.title,
      ownerName: ownerName,
      ownerId: item.ownerId,
      condition: item.condition || "Good",
      description: item.description || "",
    };

    // Build swap data
    const swapData = {
      requestedItem,
      requesterId: requesterId,
      requesterName,
      swapType,
      agreementAccepted: agreementAccepted === true || agreementAccepted === "true",
      messageToOwner: messageToOwner || "",
    };

    // Always add offeredItem with photos
    swapData.offeredItem = {
      name: offeredItem.name || offeredItem,
      condition: offeredItem.condition || "Good",
      description: offeredItem.description || "",
      photos: photos
    };
    
    // Add cashDetails if swap-with-cash
    if (swapType === 'swap-with-cash' && cashDetails) {
      swapData.cashDetails = {
        amount: parseFloat(cashDetails.amount) || 0,
        whoPays: cashDetails.whoPays
      };
    }

    // Save swap
    const swap = new Swap(swapData);
    await swap.save();

    // Mark item as inactive
    item.isActive = false;
    await item.save();

    // CREATE NOTIFICATION FOR OWNER
    const swapTypeText = swapType === 'item-for-item' ? 'item swap' : 'swap with cash';
    const offeredText = swapType === 'item-for-item' 
      ? `offering ${swapData.offeredItem.name}`
      : `offering LKR ${swapData.cashDetails.amount} + ${swapData.offeredItem.name}`;
    
    await createNotification(
      item.ownerId,
      "swap_request",
      "New Swap Request!",
      `${requesterName} wants to swap your "${item.title}". They are ${offeredText}.`,
      swap._id,
      item._id,
      { requesterName, itemTitle: item.title, swapType }
    );

    res.status(201).json({
      success: true,
      message: "Swap request created",
      data: swap,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//requester can update pending requests
const updateSwapRequest = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    
    if (!swap) {
      return res.status(404).json({ success: false, message: "Swap not found" });
    }
    
    
    if (swap.requesterId.toString() !== req.body.requesterId) {
      return res.status(403).json({ success: false, message: "Only the requester can update this swap" });
    }
   
    if (swap.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update swap with status: ${swap.status}. Only pending swaps can be updated.` 
      });
    }
    
    const {
      swapType,
      offeredItem,
      cashDetails,
      messageToOwner,
    } = req.body;
    

    if (swapType && swapType !== swap.swapType) {
      swap.swapType = swapType;
    }
    
    
    if (offeredItem) {
      swap.offeredItem = {
        name: offeredItem.name || swap.offeredItem.name,
        condition: offeredItem.condition || swap.offeredItem.condition,
        description: offeredItem.description !== undefined ? offeredItem.description : swap.offeredItem.description,
        photos: swap.offeredItem.photos 
      };
    }
  
    if (swapType === 'swap-with-cash' && cashDetails) {
      swap.cashDetails = {
        amount: parseFloat(cashDetails.amount) || swap.cashDetails?.amount || 0,
        whoPays: cashDetails.whoPays || swap.cashDetails?.whoPays || 'i-pay-owner'
      };
    } else if (swapType === 'item-for-item') {

      swap.cashDetails = undefined;
    }
    
   
    if (messageToOwner !== undefined) {
      swap.messageToOwner = messageToOwner;
    }
    
  
    swap.updatedAt = Date.now();
    
    await swap.save();
    
    res.json({
      success: true,
      message: "Swap request updated successfully",
      data: swap
    });
    
  } catch (error) {
    console.error("Error updating swap:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE SWAP WITH PHOTOS - For adding/removing photos
const updateSwapPhotos = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    
    if (!swap) {
      return res.status(404).json({ success: false, message: "Swap not found" });
    }
    
    // Check if user is the requester
    if (swap.requesterId.toString() !== req.body.requesterId) {
      return res.status(403).json({ success: false, message: "Only the requester can update this swap" });
    }
    
    // Check if status is pending
    if (swap.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update swap with status: ${swap.status}` 
      });
    }
    
    const { removePhotoIndices } = req.body;
    let currentPhotos = swap.offeredItem.photos || [];
    
    // Remove photos if specified
    if (removePhotoIndices) {
      const indicesToRemove = JSON.parse(removePhotoIndices);
      currentPhotos = currentPhotos.filter((_, index) => !indicesToRemove.includes(index));
    }
    
    // Add new photos
    const newPhotos = req.files?.map((file) => ({
      url: `/uploads/swaps/${file.filename}`,
      filename: file.filename,
    })) || [];
    
    // Combine and limit to 5
    const updatedPhotos = [...currentPhotos, ...newPhotos].slice(0, 5);
    
    swap.offeredItem.photos = updatedPhotos;
    swap.updatedAt = Date.now();
    
    await swap.save();
    
    res.json({
      success: true,
      message: "Swap photos updated successfully",
      data: swap
    });
    
  } catch (error) {
    console.error("Error updating swap photos:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user swaps - both as requester and as owner
const getUserSwaps = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const swaps = await Swap.find({
      $or: [
        { "requestedItem.ownerId": userId },
        { requesterId: userId },
      ],
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: swaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending requests for item owner
const getPendingRequests = async (req, res) => {
  try {
    const swaps = await Swap.find({
      "requestedItem.ownerId": req.params.ownerId,
      status: "pending",
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: swaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get swap by id
const getSwapById = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id); 
    if (!swap)
      return res.status(404).json({ success: false, message: "Swap not found" });
    res.json({ success: true, data: swap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update swap status (accept, reject, complete) - item owner only
const updateSwapStatus = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap)
      return res.status(404).json({ success: false, message: "Swap not found" });
    
    const oldStatus = swap.status;
    const newStatus = req.body.status;
    
    // Validate status transition
    if (oldStatus === "cancelled") {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot update a cancelled swap" 
      });
    }
    
    if (oldStatus === "completed") {
      return res.status(400).json({ 
        success: false, 
        message: "Swap already completed" 
      });
    }
    
    swap.status = newStatus;
    
    if (newStatus === "completed") {
      swap.completedAt = new Date();
      swap.completionNotes = req.body.notes || "";
    }
    
    await swap.save();

    const item = await Item.findById(swap.requestedItem.itemId);
    if (item) {
      if (newStatus === "accepted") {
      
        console.log(`Item ${item._id} remains inactive`);
        
  
        await createNotification(
          swap.requesterId,
          "swap_accepted",
          "Swap Request Accepted! ",
          `${swap.requestedItem.ownerName} has accepted your swap request for "${swap.requestedItem.name}". Time to arrange the exchange!`,
          swap._id,
          item._id,
          { ownerName: swap.requestedItem.ownerName, itemTitle: swap.requestedItem.name }
        );
        
      } else if (newStatus === "rejected") {
        // Only make available again if it was pending
        if (oldStatus === "pending") {
          item.isActive = true;
          await item.save();
          console.log(`Item ${item._id} is now available`);
        }
        
        await createNotification(
          swap.requesterId,
          "swap_rejected",
          "Swap Request Rejected ",
          `${swap.requestedItem.ownerName} has rejected your swap request for "${swap.requestedItem.name}". You can try swapping with other items.`,
          swap._id,
          item._id,
          { ownerName: swap.requestedItem.ownerName, itemTitle: swap.requestedItem.name }
        );
        
      } else if (newStatus === "completed") {
     
        console.log(`Swap ${swap._id} completed, item remains inactive`);
        
     
        await createNotification(
          swap.requesterId,
          "swap_completed",
          "Swap Completed Successfully! 🎉",
          `Your swap with ${swap.requestedItem.ownerName} for "${swap.requestedItem.name}" has been completed. Thank you for using SwapNest!`,
          swap._id,
          item._id,
          { otherParty: swap.requestedItem.ownerName, itemTitle: swap.requestedItem.name }
        );
        
        // Notify owner
        await createNotification(
          swap.requestedItem.ownerId,
          "swap_completed",
          "Swap Completed Successfully! 🎉",
          `Your swap with ${swap.requesterName} for "${swap.requestedItem.name}" has been completed. Thank you for using SwapNest!`,
          swap._id,
          item._id,
          { otherParty: swap.requesterName, itemTitle: swap.requestedItem.name }
        );
      }
    }
    
    res.json({
      success: true,
      message: `Swap ${newStatus}`,
      data: swap,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel swap request - requester only
const cancelSwapRequest = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) 
      return res.status(404).json({ success: false, message: 'Swap not found' });
    
    // Only allow cancellation if status is pending
    if (swap.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending swaps can be cancelled' 
      });
    }
    
    swap.status = 'cancelled';
    await swap.save();

    // Make item available again
    const item = await Item.findById(swap.requestedItem.itemId);
    if (item && !item.isActive) {
      item.isActive = true;
      await item.save();
      console.log(`Item ${item._id} is now available`);
    }
    
    // CREATE NOTIFICATION FOR OWNER (Swap Cancelled)
    await createNotification(
      swap.requestedItem.ownerId,
      "swap_cancelled",
      "Swap Request Cancelled",
      `${swap.requesterName} has cancelled their swap request for "${swap.requestedItem.name}". Your item is now available again.`,
      swap._id,
      item?._id,
      { requesterName: swap.requesterName, itemTitle: swap.requestedItem.name }
    );

    res.json({ success: true, message: 'Swap cancelled', data: swap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all swaps - admin only
const getAllSwaps = async (req, res) => {
  try {
    const { status, swapType, sort } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (swapType) filter.swapType = swapType;
    
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'status') sortOption = { status: 1, createdAt: -1 };

    const swaps = await Swap.find(filter).sort(sortOption);
    res.status(200).json({ success: true, count: swaps.length, data: swaps });
  } catch (error) {
    console.error('Error fetching all swaps:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete swap - admin only
const deleteSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: "Swap not found"
      });
    }
    
    // Make item available again if swap was pending
    if (swap.status === "pending") {
      const item = await Item.findById(swap.requestedItem.itemId);
      if (item) {
        item.isActive = true;
        await item.save();
        console.log(`Item ${item._id} is now available`);
      }
    }

    // Permanent delete
    await Swap.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Swap permanently deleted",
      deletedId: req.params.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get swaps by item
const getSwapsByItem = async (req, res) => {
  try {
    const { itemId, status } = req.query;
    const filter = { "requestedItem.itemId": itemId };
    if (status) filter.status = status;
    
    const swaps = await Swap.find(filter);
    res.json({ success: true, data: swaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestCompletion = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ success: false, message: "Swap not found" });
    }

    const userId = req.body.userId;
    const userRole = req.body.userRole; // 'requester' or 'owner'

    // Check if swap is accepted
    if (swap.status !== 'accepted') {
      return res.status(400).json({ 
        success: false, 
        message: "Swap must be accepted before completing" 
      });
    }

    // Check if already completed
    if (swap.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: "Swap already completed" 
      });
    }

    // Mark completion for the user
    if (userRole === 'requester') {
      if (swap.completionConfirmedBy.requester) {
        return res.status(400).json({ 
          success: false, 
          message: "You have already confirmed completion" 
        });
      }
      swap.completionConfirmedBy.requester = true;
    } else if (userRole === 'owner') {
      if (swap.completionConfirmedBy.owner) {
        return res.status(400).json({ 
          success: false, 
          message: "You have already confirmed completion" 
        });
      }
      swap.completionConfirmedBy.owner = true;
    }

    // Set completion requested time if this is the first confirmation
    if (!swap.completionConfirmedBy.requester && !swap.completionConfirmedBy.owner) {
      swap.completionRequestedAt = new Date();
    }

    // Check if both have confirmed
    if (swap.completionConfirmedBy.requester && swap.completionConfirmedBy.owner) {
      // Both confirmed - swap is complete
      swap.status = 'completed';
      swap.completedAt = new Date();
      swap.bothConfirmedAt = new Date();
      swap.completionNotes = "Swap completed by both parties";
      
      await swap.save();
      
      // Create notifications for both parties
      await createNotification(
        swap.requesterId,
        "swap_completed",
        "Swap Completed Successfully! 🎉",
        `Both you and ${swap.requestedItem.ownerName} have confirmed the swap for "${swap.requestedItem.name}" is complete. Thank you for using SwapNest!`,
        swap._id,
        swap.requestedItem.itemId,
        { otherParty: swap.requestedItem.ownerName, itemTitle: swap.requestedItem.name }
      );
      
      await createNotification(
        swap.requestedItem.ownerId,
        "swap_completed",
        "Swap Completed Successfully! 🎉",
        `Both you and ${swap.requesterName} have confirmed the swap for "${swap.requestedItem.name}" is complete. Thank you for using SwapNest!`,
        swap._id,
        swap.requestedItem.itemId,
        { otherParty: swap.requesterName, itemTitle: swap.requestedItem.name }
      );
      
      res.json({
        success: true,
        message: "Swap completed successfully! Both parties have confirmed.",
        data: swap,
        bothConfirmed: true
      });
    } else {
      // Only one confirmed - waiting for other party
      await swap.save();
      
      // Notify the other party that completion is pending
      const otherPartyId = userRole === 'requester' ? swap.requestedItem.ownerId : swap.requesterId;
      const otherPartyName = userRole === 'requester' ? swap.requestedItem.ownerName : swap.requesterName;
      const currentUserName = userRole === 'requester' ? swap.requesterName : swap.requestedItem.ownerName;
      
      await createNotification(
        otherPartyId,
        "completion_pending",
        "Swap Completion Pending",
        `${currentUserName} has marked the swap for "${swap.requestedItem.name}" as complete. Please confirm to complete the swap.`,
        swap._id,
        swap.requestedItem.itemId,
        { otherParty: currentUserName, itemTitle: swap.requestedItem.name }
      );
      
      res.json({
        success: true,
        message: `You have marked the swap as complete. Waiting for ${otherPartyName} to confirm.`,
        data: swap,
        bothConfirmed: false
      });
    }
  } catch (error) {
    console.error("Error requesting completion:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get completion status for a swap
const getCompletionStatus = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ success: false, message: "Swap not found" });
    }
    
    res.json({
      success: true,
      data: {
        requesterConfirmed: swap.completionConfirmedBy.requester,
        ownerConfirmed: swap.completionConfirmedBy.owner,
        bothConfirmed: swap.completionConfirmedBy.requester && swap.completionConfirmedBy.owner,
        completionRequestedAt: swap.completionRequestedAt,
        bothConfirmedAt: swap.bothConfirmedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export {
  createSwapRequest,
  updateSwapRequest,
  updateSwapPhotos,
  getUserSwaps,
  getPendingRequests,
  getSwapById,
  updateSwapStatus,
  cancelSwapRequest,
  getAllSwaps,
  deleteSwap,
  getSwapsByItem,
  createNotification,
  getCompletionStatus,
  requestCompletion
};