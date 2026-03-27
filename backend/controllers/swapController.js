import Swap from "../models/Swap.js";
import Item from "../models/Item.js";
import User from "../models/User.js";
import mongoose from "mongoose";

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

   
    if (item.mode === "Sell" && swapType !== "swap-with-cash") {
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

    // Process photos for BOTH types
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

    // Update associated item status
    const item = await Item.findById(swap.requestedItem.itemId);
    if (item) {
      if (newStatus === "accepted") {
        
        console.log(`Item ${item._id} remains inactive`);
      } else if (newStatus === "rejected" || newStatus === "cancelled") {
        
        if (oldStatus === "pending") {
          item.isActive = true;
          await item.save();
          console.log(`Item ${item._id} is now available`);
        }
      } else if (newStatus === "completed") {
        
        console.log(`Swap ${swap._id} completed, item remains inactive`);
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

export {
  createSwapRequest,
  getUserSwaps,
  getPendingRequests,
  getSwapById,
  updateSwapStatus,
  cancelSwapRequest,
  getAllSwaps,
  deleteSwap,
  getSwapsByItem
};