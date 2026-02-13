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

    const hasLat = lat !== undefined && lat !== null && lat !== "";
    const hasLng = lng !== undefined && lng !== null && lng !== "";

    if (!title || price === undefined || price === null || !category || !hasLat || !hasLng) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    const priceNum = Number(price);

    if (
      Number.isNaN(latNum) ||
      Number.isNaN(lngNum) ||
      latNum < -90 ||
      latNum > 90 ||
      lngNum < -180 ||
      lngNum > 180
    ) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    if (Number.isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const newItem = await Item.create({
      title,
      description,
      price: priceNum,
      category,
      image,
      contact,
      ownerId: ownerId || "anonymous",
      location: {
        type: "Point",
        coordinates: [lngNum, latNum],
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

    const payload = { ...req.body };

    if (payload.price !== undefined) {
      const priceNum = Number(payload.price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ message: "Invalid price" });
      }
      payload.price = priceNum;
    }

    const hasLat = payload.lat !== undefined && payload.lat !== null && payload.lat !== "";
    const hasLng = payload.lng !== undefined && payload.lng !== null && payload.lng !== "";
    if (hasLat || hasLng) {
      if (!hasLat || !hasLng) {
        return res.status(400).json({ message: "Both lat and lng are required for location update" });
      }

      const latNum = Number(payload.lat);
      const lngNum = Number(payload.lng);
      if (
        Number.isNaN(latNum) ||
        Number.isNaN(lngNum) ||
        latNum < -90 ||
        latNum > 90 ||
        lngNum < -180 ||
        lngNum > 180
      ) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }

      payload.location = {
        type: "Point",
        coordinates: [lngNum, latNum],
      };
    }

    delete payload.lat;
    delete payload.lng;

    Object.assign(item, payload);
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
    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (
      Number.isNaN(latNum) ||
      Number.isNaN(lngNum) ||
      latNum < -90 ||
      latNum > 90 ||
      lngNum < -180 ||
      lngNum > 180
    ) {
      return res.status(400).json({ message: "Valid lat and lng query params are required" });
    }

    if (Number.isNaN(km) || km <= 0) {
      return res.status(400).json({ message: "Distance must be a positive number" });
    }

    const items = await Item.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lngNum, latNum],
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
