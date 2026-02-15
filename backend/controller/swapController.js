const Swap=require('../model/Swap');
const Post = require('../models/Post'); //-------add the item listning model part(Post want to change as item det)
const mongoose=require('mongoose');

//create swap req
const createSwapRequest=async(req,res)=>{
    try{
        const {postId, requesterId, requesterName,swapType,offeredItem,cashDetails,messageToOwner,agreementAccepted }=req.body;
        
        //validate required fields
        if(!postId||!requesterId||!requesterName||!swapType){
            return res.status(400).json({success:false,message:'Missing required fields'});
        }

        //convet stringids to objectids
        const postObjectId=new mongoose.Types.ObjectId(postId);
        const requesterObjectId=new mongoose.Types.ObjectId(requesterId);

        //get post details
        const post= await Post.findById(postObjectId);
        if(!post) return res.status(404).json({success:false,message:'Post not found'});
        if(post.status!=='available') return res.status(404).json({success:false,message:'Item not available'});
        if(post.ownerId.toString()===requesterId) return res.status(404).json({success:false,message:'Cannot swap your own item'});

        //prep requested item
        const requestedItem={
            postId:postObjectId,
            name:post.itemName,   //want to change
            ownerName:post.ownerName,
            ownerId:post.ownerId,
            condition:post.condition,
            description:post.description||''
        };

        //process 4to(want to change)
        const photos=req.files?.map(file=>({url:`/uploads/swaps/${file.filename}`,filename:file.filename}));

        //build swap data
        const swapData={
            requestedItem,
            requesterId:requesterObjectId,
            requesterName,
            swapType,
            agreementAccepted:agreementAccepted===true||agreementAccepted==='true',
            messageToOwner: messageToOwner || ''                    //check
        };

        //add conditionall fields
        if(swapType==='item-for-item'&&offeredItem){
            swapData.offeredItem={
                name:offeredItem.name||offeredItem,
                condition:offeredItem.condition||'Good',
                description:offeredItem.description||'',
                photos
            };
        }

        //save swap & update post
        const swap=new Swap(swapData);
        await swap.save();

        post.status='pending';
        await post.save();

        res.status(201).json({
            success:true,
            message:'Swap request created',
            data:{
                requestId:swap.requestId,
                id:swap._id,
                status:swap.status,
                createdAt:swap.createdAt,
                requestedItem:swap.requestedItem,
                swapType:swap.swapType,
                offeredItem:swap.offeredItem,
                cashDetails:swap.cashDetails,
                messageToOwner:swap.messageToOwner
            }
        });
    }catch(error){
        console.error('Error:',error);
        res.status(500).json({success:false,message:error.message});
    }
    
}

module.exports={
    createSwapRequest
};