import Swap from "../models/Swap.js";
import Item from "../models/Item.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { deleteSwapPhoto } from "../middlewares/swapCloudinaryUpload.js"; 
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

    if (!itemId || !requesterId || !requesterName || !swapType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    
    if (!item.isActive) return res.status(400).json({ success: false, message: "Item not available" });
    
    if (item.ownerId.toString() === requesterId) {
      return res.status(400).json({ success: false, message: "Cannot swap your own item" });
    }

    if (item.mode === "SELL" && swapType !== "swap-with-cash") {
      return res.status(400).json({ 
        success: false, 
        message: "This item is for sale only. Please use swap-with-cash." 
      });
    }

    let ownerName = "Unknown";
    try {
      const owner = await User.findById(item.ownerId);
      if (owner) ownerName = owner.username;
    } catch (userError) {
      console.log("User lookup failed, using default name");
    }

   
    const photos = req.files?.map((file) => ({
      url: file.path,           
      publicId: file.filename,  
      originalName: file.originalname,
    })) || [];

    console.log("📸 Cloudinary uploaded photos:", photos);

    const requestedItem = {
      itemId: item._id,
      name: item.title,
      ownerName: ownerName,
      ownerId: item.ownerId,
      condition: item.condition || "Good",
      description: item.description || "",
      photos: item.images || [],
      coverImage: item.coverImage
    };

    const swapData = {
      requestedItem,
      requesterId: requesterId,
      requesterName,
      swapType,
      agreementAccepted: agreementAccepted === true || agreementAccepted === "true",
      messageToOwner: messageToOwner || "",
    };

    swapData.offeredItem = {
      name: offeredItem.name || offeredItem,
      condition: offeredItem.condition || "Good",
      description: offeredItem.description || "",
      photos: photos
    };
    
    if (swapType === 'swap-with-cash' && cashDetails) {
      swapData.cashDetails = {
        amount: parseFloat(cashDetails.amount) || 0,
        whoPays: cashDetails.whoPays
      };
    }

    const swap = new Swap(swapData);
    await swap.save();

    item.isActive = false;
    await item.save();

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

// Update swap request (without photos)
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

// Update swap photos (Cloudinary version)
const updateSwapPhotos = async (req, res) => {
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
        message: `Cannot update swap with status: ${swap.status}` 
      });
    }
    
    const { removePhotoIndices } = req.body;
    let currentPhotos = swap.offeredItem.photos || [];
    
    // Delete removed photos from Cloudinary
    if (removePhotoIndices) {
      const indicesToRemove = JSON.parse(removePhotoIndices);
      const photosToDelete = indicesToRemove.map(index => currentPhotos[index]);
      
      for (const photo of photosToDelete) {
        if (photo.publicId) {
          await deleteSwapPhoto(photo.publicId);
        }
      }
      
      currentPhotos = currentPhotos.filter((_, index) => !indicesToRemove.includes(index));
    }
    
    // Add new Cloudinary photos
    const newPhotos = req.files?.map((file) => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
    })) || [];
    
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

// Get user swaps
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

// Get pending requests
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

// Update swap status
const updateSwapStatus = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap)
      return res.status(404).json({ success: false, message: "Swap not found" });
    
    const oldStatus = swap.status;
    const newStatus = req.body.status;
    
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
        await createNotification(
          swap.requesterId,
          "swap_accepted",
          "Swap Request Accepted! ✅",
          `${swap.requestedItem.ownerName} has accepted your swap request for "${swap.requestedItem.name}".`,
          swap._id,
          item._id,
          { ownerName: swap.requestedItem.ownerName, itemTitle: swap.requestedItem.name }
        );
        
      } else if (newStatus === "rejected") {
        if (oldStatus === "pending") {
          item.isActive = true;
          await item.save();
        }
        
        await createNotification(
          swap.requesterId,
          "swap_rejected",
          "Swap Request Rejected ❌",
          `${swap.requestedItem.ownerName} has rejected your swap request for "${swap.requestedItem.name}".`,
          swap._id,
          item._id,
          { ownerName: swap.requestedItem.ownerName, itemTitle: swap.requestedItem.name }
        );
        
      } else if (newStatus === "completed") {
        await createNotification(
          swap.requesterId,
          "swap_completed",
          "Swap Completed Successfully! 🎉",
          `Your swap with ${swap.requestedItem.ownerName} for "${swap.requestedItem.name}" has been completed.`,
          swap._id,
          item._id,
          { otherParty: swap.requestedItem.ownerName, itemTitle: swap.requestedItem.name }
        );
        
        await createNotification(
          swap.requestedItem.ownerId,
          "swap_completed",
          "Swap Completed Successfully! 🎉",
          `Your swap with ${swap.requesterName} for "${swap.requestedItem.name}" has been completed.`,
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

// Cancel swap request
const cancelSwapRequest = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) 
      return res.status(404).json({ success: false, message: 'Swap not found' });
    
    if (swap.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending swaps can be cancelled' 
      });
    }
    
    swap.status = 'cancelled';
    await swap.save();

    const item = await Item.findById(swap.requestedItem.itemId);
    if (item && !item.isActive) {
      item.isActive = true;
      await item.save();
    }
    
    await createNotification(
      swap.requestedItem.ownerId,
      "swap_cancelled",
      "Swap Request Cancelled",
      `${swap.requesterName} has cancelled their swap request for "${swap.requestedItem.name}".`,
      swap._id,
      item?._id,
      { requesterName: swap.requesterName, itemTitle: swap.requestedItem.name }
    );

    res.json({ success: true, message: 'Swap cancelled', data: swap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all swaps (admin)
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

// Delete swap with Cloudinary cleanup
const deleteSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: "Swap not found"
      });
    }
    
    // Delete all associated photos from Cloudinary
    if (swap.offeredItem?.photos && swap.offeredItem.photos.length > 0) {
      console.log(`🗑️ Deleting ${swap.offeredItem.photos.length} photos from Cloudinary...`);
      
      for (const photo of swap.offeredItem.photos) {
        if (photo.publicId) {
          await deleteSwapPhoto(photo.publicId);
        }
      }
    }
    
    if (swap.status === "pending") {
      const item = await Item.findById(swap.requestedItem.itemId);
      if (item) {
        item.isActive = true;
        await item.save();
      }
    }

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

// Request completion
const requestCompletion = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ success: false, message: "Swap not found" });
    }

    const userId = req.body.userId;
    const userRole = req.body.userRole;

    if (swap.status !== 'accepted') {
      return res.status(400).json({ 
        success: false, 
        message: "Swap must be accepted before completing" 
      });
    }

    if (swap.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: "Swap already completed" 
      });
    }

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

    if (!swap.completionConfirmedBy.requester && !swap.completionConfirmedBy.owner) {
      swap.completionRequestedAt = new Date();
    }

    if (swap.completionConfirmedBy.requester && swap.completionConfirmedBy.owner) {
      swap.status = 'completed';
      swap.completedAt = new Date();
      swap.bothConfirmedAt = new Date();
      swap.completionNotes = "Swap completed by both parties";
      
      await swap.save();
      
      await createNotification(
        swap.requesterId,
        "swap_completed",
        "Swap Completed Successfully! 🎉",
        `Both you and ${swap.requestedItem.ownerName} have confirmed the swap.`,
        swap._id,
        swap.requestedItem.itemId,
        { otherParty: swap.requestedItem.ownerName, itemTitle: swap.requestedItem.name }
      );
      
      await createNotification(
        swap.requestedItem.ownerId,
        "swap_completed",
        "Swap Completed Successfully! 🎉",
        `Both you and ${swap.requesterName} have confirmed the swap.`,
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
      await swap.save();
      
      const otherPartyId = userRole === 'requester' ? swap.requestedItem.ownerId : swap.requesterId;
      const otherPartyName = userRole === 'requester' ? swap.requestedItem.ownerName : swap.requesterName;
      const currentUserName = userRole === 'requester' ? swap.requesterName : swap.requestedItem.ownerName;
      
      await createNotification(
        otherPartyId,
        "completion_pending",
        "Swap Completion Pending",
        `${currentUserName} has marked the swap as complete. Please confirm.`,
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

// Get completion status
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