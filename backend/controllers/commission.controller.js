import { CommissionRequest, Users, Artist, Clients } from "../models/index.js";

export const createCommissionRequest = async (req, res) => {
  try {
    const { artistId, description, price } = req.body;
    const clientUserId = req.user.userId;

    // Validate that the requester is a client
    const clientProfile = await Clients.findOne({ where: { userId: clientUserId } });
    if (!clientProfile) {
      return res.status(403).json({ error: "Only clients can create commission requests" });
    }

    // Validate that the artist exists and get their userId
    const artist = await Artist.findOne({ where: { artistId: artistId } });
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const commission = await CommissionRequest.create({
      artistId: artist.userId, // Use the artist's userId, not artistId
      clientId: clientUserId,
      description,
      price,
      status: 'pending'
    });

    const commissionWithDetails = await CommissionRequest.findByPk(commission.id, {
      include: [
        { model: Users, as: "artist" },
        { model: Users, as: "client" }
      ]
    });

    res.status(201).json(commissionWithDetails);
  } catch (error) {
    console.error("Error creating commission request:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getCommissionsByArtist = async (req, res) => {
  try {
    const userId = req.params.artistId || req.user.userId;
    
    // If artistId param is provided, it might be the Artist model's artistId
    // We need to convert it to userId
    let artistUserId = userId;
    
    if (req.params.artistId) {
      // Check if this is an Artist.artistId (numeric ID from Artist table)
      const artist = await Artist.findOne({ where: { artistId: req.params.artistId } });
      if (artist) {
        artistUserId = artist.userId;
      } else {
        // Maybe it's already a userId, validate that user exists
        const user = await Users.findByPk(req.params.artistId);
        if (!user) {
          return res.status(404).json({ error: "Artist not found" });
        }
        artistUserId = req.params.artistId;
      }
    }

    const commissions = await CommissionRequest.findAll({
      where: { artistId: artistUserId }, // Use userId in artistId field
      include: [
        { model: Users, as: "client" }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(commissions);
  } catch (error) {
    console.error("Error fetching commissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCommissionsByClient = async (req, res) => {
  try {
    const clientId = req.user.userId;

    const commissions = await CommissionRequest.findAll({
      where: { clientId },
      include: [
        { model: Users, as: "artist" }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(commissions);
  } catch (error) {
    console.error("Error fetching commissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCommissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const commission = await CommissionRequest.findByPk(id);
    if (!commission) {
      return res.status(404).json({ error: "Commission not found" });
    }

    // Check permissions - only artist can accept/reject, only client can mark as completed
    if (status === 'accepted' || status === 'rejected') {
      const artist = await Artist.findOne({ where: { userId } });
      if (!artist || commission.artistId !== artist.userId) {
        return res.status(403).json({ error: "Only the assigned artist can accept or reject commissions" });
      }
    } else if (status === 'completed') {
      if (commission.clientId !== userId) {
        return res.status(403).json({ error: "Only the client can mark commissions as completed" });
      }
    }

    await commission.update({ status });

    const updatedCommission = await CommissionRequest.findByPk(id, {
      include: [
        { model: Users, as: "artist" },
        { model: Users, as: "client" }
      ]
    });

    res.status(200).json(updatedCommission);
  } catch (error) {
    console.error("Error updating commission status:", error);
    res.status(400).json({ error: error.message });
  }
};

export const addProgressUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, imageUrl } = req.body;
    const userId = req.user.userId;

    const commission = await CommissionRequest.findByPk(id);
    if (!commission) {
      return res.status(404).json({ error: "Commission not found" });
    }

    // Check that the user is the assigned artist
    const artist = await Artist.findOne({ where: { userId } });
    if (!artist || commission.artistId !== artist.userId) {
      return res.status(403).json({ error: "Only the assigned artist can add progress updates" });
    }

    const update = await commission.addProgressUpdate(message, imageUrl);

    res.status(201).json(update);
  } catch (error) {
    console.error("Error adding progress update:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getCommissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const commission = await CommissionRequest.findByPk(id, {
      include: [
        { model: Users, as: "artist" },
        { model: Users, as: "client" }
      ]
    });

    if (!commission) {
      return res.status(404).json({ error: "Commission not found" });
    }

    // Check permissions - only client or artist involved can view
    const artist = await Artist.findOne({ where: { userId } });
    const isArtist = artist && commission.artistId === artist.userId;
    const isClient = commission.clientId === userId;

    if (!isArtist && !isClient) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json(commission);
  } catch (error) {
    console.error("Error fetching commission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCommissions = async (req, res) => {
  try {
    // This is an admin endpoint - you might want to add admin authorization
    const commissions = await CommissionRequest.findAll({
      include: [
        { model: Users, as: "artist" },
        { model: Users, as: "client" }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(commissions);
  } catch (error) {
    console.error("Error fetching all commissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};