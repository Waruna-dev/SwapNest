import Swap from "../models/Swap.js";
import  Item  from "../models/Item.js";
import  User  from "../models/User.js";
import mongoose from "mongoose";

//create  swap req
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

    //validate required fields
    if (!itemId || !requesterId || !requesterName || !swapType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const item = await Item.findById(itemId);  // itemId is already a valid MongoDB ID string
    if (!item)
      return res.status(404).json({ success: false, message: "Item not found" });
    
    if (!item.isActive)
      return res.status(400).json({ success: false, message: "Item not available" });
    
    if (item.ownerId.toString() === requesterId)
      return res.status(400).json({ success: false, message: "Cannot swap your own item" });

    // Check mode 
    if (item.mode === "SELL" && swapType !== "swap-with-cash") {
      return res.status(400).json({ 
        success: false, 
        message: "This item is for sale only. Please use swap-with-cash." 
      });
    }
    // Check mode 
if (item.mode === "Swap" && swapType !== "item-for-item") {
  return res.status(400).json({ 
    success: false, 
    message: "This item is for swapping only. Please use item-for-item." 
  });
}

    let ownerName = "Unknown";
    try {
      
      const owner = await User.findById(item.ownerId);
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

    //swap data - use requesterId as string, not converted
    const swapData = {
      requestedItem,
      requesterId: requesterId,  
      requesterName,
      swapType,
      agreementAccepted: agreementAccepted === true || agreementAccepted === "true",
      messageToOwner: messageToOwner || "",
    };

    // Add conditional fields
    if (swapType === "item-for-item" && offeredItem) {
      swapData.offeredItem = {
        name: offeredItem.name || offeredItem,
        condition: offeredItem.condition || "Good",
        description: offeredItem.description || "",
        photos
      };
    } else if (swapType === 'swap-with-cash' && cashDetails) {
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
//get user swaps-user
const getUserSwaps = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [
        { "requestedItem.ownerId": req.params.userId },
        { requesterId: req.params.userId },
      ], 
    });
    res.json({ success: true, data: swaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//get pending req-user
const getPendingRequests = async (req, res) => {
  try {
    const swaps = await Swap.find({
      "requestedItem.ownerId": req.params.ownerId,
      status: "pending",
    });
    res.json({ success: true, data: swaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//get swap by id-user
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

//update swap stat(accept,cancel,reject)-user(item owner only)
const updateSwapStatus = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap)
      return res.status(404).json({ success: false, message: "swap  not found" });
    const oldStatus = swap.status;
    swap.status = req.body.status;
    await swap.save();

    //update associated post status
    const item = await Item.findById(swap.requestedItem.itemId);
    if (item) {
      if (req.body.status === "accepted") {
        /////post.status = "swapped";
        console.log(`Item ${item._id} remains inactive`); //post id want to change
      } else if (req.body.status === "rejected" ||req.body.status === "cancelled") 
        {
        //only make available again if it was pending
        if (oldStatus === "pending") {
          item.isActive = true;
          await item.save();
          console.log(`Item ${item._id} is now available`);
        }
      }
    }
    res.json({
      success: true,message: "Status Updated",
      data: { swap: swap},  ////data: { swap: swap, post: post },
    });
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
};

//cancel req-user(requester only)
const cancelSwapRequest=async(req,res)=>{
    try{
        const swap=await Swap.findById(req.params.id);
        if(!swap) return res.status(404).json({success:false,message:'swap not found'});
        swap.status='cancelled';
        await swap.save();

        //make item avilable again
       /* const item=await Item.findById(swap.requestedItem.postId);
        if(item&&post.status==='pending'){
            item.status='available';
            await post.save();
            console.log(`Post ${post._id} status updated to:available`);
        } */
        
        const item = await Item.findById(swap.requestedItem.itemId); 
        if (item && !item.isActive) {
          item.isActive = true;
          await item.save();
          console.log(`Item ${item._id} is now available`);
    }

        res.json({success:true,message:'Swap cancelled',data:swap});
    }catch(error){
        res.status(500).json({success:false,message:error.message});
    };
};

//get all swap-admin check(with optional filters)
const getAllSwaps=async(req,res)=>{
    try{
        const{status,swapType,sort}=req.query;
        //build filter object
        let filter={};
        if(status) filter.status=status;
        if(swapType) filter.swapType=swapType;
        //build with newest first
        let sortOption={createdAt:-1};
        if(sort==='oldest')sortOption={createdAt:1};
        if(sort==='status')sortOption={status:1,createdAt:-1};

        const swaps = await Swap.find(filter).sort(sortOption);
        res.status(200).json({success:true,count:swaps.length,filters:{status,swapType},data:swaps});
    }catch(error){
        console.error('error fetching all swaps:',error);
        res.status(500).json({success:false,message:error.message});
    };
}

//delete
const deleteSwap=async(req,res)=>{
  try{
    const swap=await Swap.findById(req.params.id);

    if (!swap){
      return res.status(404).json({
        success:false,
        message:"Swap not found"

      });
    }
    ///make item available again
    if(swap.status==="pending"){
      const item=await Item.findById(swap.requestedItem.itemId);
      if(item){
        item.isActive=true;
        await item.save();
        console.log(`Item ${item._id} is now availbale`);

      }
    }

    //permenant delete 
    await Swap.findByIdAndDelete(req.params.id);

    res.json({
      succes:true,
      message:"Swao permenantly deleted",
      deletedId:req.params.id
    })
  }catch(error){
    res.status(500).json({
      success:false,
      message:error.message
    });
  }
}
export {
    createSwapRequest,
    getUserSwaps,
    getPendingRequests,
    getSwapById,
    updateSwapStatus,
    cancelSwapRequest,
    getAllSwaps,
    deleteSwap
};