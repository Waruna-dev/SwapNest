import Swap from "../models/Swap.js";
import  Item  from "../models/Item.js";
import  User  from "../models/User.js";
import mongoose from "mongoose";

//create swap req
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

    //convet stringids to objectids
    const itemObjectId = new mongoose.Types.ObjectId(itemId);
    const requesterObjectId = new mongoose.Types.ObjectId(requesterId);

    //get post details
    const item = await Item.findById(itemObjectId);
    if (!item)
      return res.status(404).json({ success: false, message: "Item not found" });
    if (!item.isActive)
      return res.status(404).json({ success: false, message: "Item not available" });
    if (item.ownerId.toString() === requesterId)
      return res.status(404).json({ success: false, message: "Cannot swap your own item" });

    // /////Get owner name from User model
    const owner = await User.findById(item.ownerId);
    const ownerName = owner ? owner.username : "Unknown";

    //prep requested item
    const requestedItem = {
      itemId: itemObjectId,
      name: item.title, //want to change
      ownerName: ownerName,
      ownerId: item.ownerId,
      condition: "Good",                      // ask kasun for this
      description: item.description || "",
    };

    //process 4to(want to change)
    const photos = req.files?.map((file) => ({
      url: `/uploads/swaps/${file.filename}`,
      filename: file.filename,
    })) ||[];                                  //check

    //build swap data
    const swapData = {
      requestedItem,
      requesterId: requesterObjectId,
      requesterName,
      swapType,
      agreementAccepted:
        agreementAccepted === true || agreementAccepted === "true",
      messageToOwner: messageToOwner || "", //check
    };

    //add conditionall fields
    if (swapType === "item-for-item" && offeredItem) {
      swapData.offeredItem = {
        name: offeredItem.name || offeredItem,
        condition: offeredItem.condition || "Good",
        description: offeredItem.description || "",
        photos
      };
    }else if(swapType==='swap-with-cash'&&cashDetails){
      swapData.cashDetails={
        amount:parseFloat(cashDetails.amount)|| 0,
        whoPays:cashDetails.whoPays
      };
    }

    //save swap & update post
    const swap = new Swap(swapData);
    await swap.save();

    item.isActive = false;                 ///////////// item.isActive = "pending"; 
    await item.save();

    res.status(201).json({
      success: true,
      message: "Swap request created",
      data: {
        requestId: swap.requestId,
        id: swap._id,
        status: swap.status,
        createdAt: swap.createdAt,
        requestedItem: swap.requestedItem,
        swapType: swap.swapType,
        offeredItem: swap.offeredItem,
        cashDetails: swap.cashDetails,
        messageToOwner: swap.messageToOwner,
      },
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
      ], //wants to change userID
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
    const swap = await Swap.findById(req.params.id); //id
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
        
        const item = await Item.findById(swap.requestedItem.itemId); // FIXED: using Item, not Post
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


export {
    createSwapRequest,
    getUserSwaps,
    getPendingRequests,
    getSwapById,
    updateSwapStatus,
    cancelSwapRequest,
    getAllSwaps
};