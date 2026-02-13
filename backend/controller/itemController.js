import Item from "../model/Item.js";

// CREATE ITEM
export const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      image,
      contact,
      lat,
      lng,
      ownerId,
    } = req.body;

    if (!title || !price || !category || !lat || !lng) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newItem = await Item.create({
      title,
      description,
      price,
      category,
      image,
      contact,
      ownerId: ownerId || "anonymous",
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL ITEMS
export const getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE ITEM
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ITEM
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    Object.assign(item, req.body);
    const updated = await item.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ITEM
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEARBY SEARCH
export const getNearbyItems = async (req, res) => {
  try {
    const { lat, lng, distance } = req.query;

    const km = distance ? Number(distance) : 10;

    const items = await Item.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: km * 1000,
        },
      },
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export  function   getAllItems (req, res)  {
//   res.status(200).send('Get all items');
// }

// export  function   createItem (req, res)  {
//   res.status(201).send('Item created');
// }

// export  function   getItemById (req, res)  {
//   const { id } = req.params;
//   res.status(200).json({ message: `item details for id ${id}` });
// }

// export  function   updateItem(req, res)  {
//   res.status(200).json({ message: 'item updated' });

// }

// export  function   deleteItem(req, res){
//   res.status(200).json({ message: 'item deleted' });
// }
