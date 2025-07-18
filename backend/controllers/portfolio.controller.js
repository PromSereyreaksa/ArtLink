import { Portfolios } from "../models/portfolio.model.js";
import { Op } from "sequelize";

export const createPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolios.createPortfolio(req.body);
    res.status(201).json(portfolio);
  } catch (error) {
    console.error("Error creating portfolio:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolios.findAll({
      include: [{ model: Portfolios.Freelancer, as: "freelancer" }],
    });
    res.status(200).json(portfolios);
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolios.findByPk(req.params.id, {
      include: [{ model: Portfolios.Freelancer, as: "freelancer" }],
    });
    if (!portfolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }
    res.status(200).json(portfolio);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePortfolio = async (req, res) => {
  try {
    const [updated] = await Portfolios.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({ error: "Portfolio not found" });
    }
    const updatedPortfolio = await Portfolios.findByPk(req.params.id);
    res.status(200).json(updatedPortfolio);
  } catch (error) {
    console.error("Error updating portfolio:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deletePortfolio = async (req, res) => {
  try {
    const deleted = await Portfolios.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ error: "Portfolio not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPortfoliosByFreelancerId = async (req, res) => {
  try {
    const portfolios = await Portfolios.findAll({
      where: { freelancerId: req.params.freelancerId },
      include: [{ model: Portfolios.Freelancer, as: "freelancer" }],
    });
    if (!portfolios.length) {
      return res
        .status(404)
        .json({ error: "No portfolios found for this freelancer" });
    }
    res.status(200).json(portfolios);
  } catch (error) {
    console.error("Error fetching portfolios by freelancer ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPortfoliosByTag = async (req, res) => {
  try {
    const portfolios = await Portfolios.findAll({
      where: {
        tags: {
          [Op.contains]: [req.params.tag],
        },
      },
      include: [{ model: Portfolios.Freelancer, as: "freelancer" }],
    });
    if (!portfolios.length) {
      return res
        .status(404)
        .json({ error: "No portfolios found with this tag" });
    }
    res.status(200).json(portfolios);
  } catch (error) {
    console.error("Error fetching portfolios by tag:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPortfoliosByFreelancerName = async (req, res) => {
  try {
    const portfolios = await Portfolios.findAll({
      include: [
        {
          model: Portfolios.Freelancer,
          as: "freelancer",
          where: { name: { [Op.iLike]: `%${req.params.name}%` } },
        },
      ],
    });
    if (!portfolios.length) {
      return res
        .status(404)
        .json({ error: "No portfolios found for this freelancer name" });
    }
    res.status(200).json(portfolios);
  } catch (error) {
    console.error("Error fetching portfolios by freelancer name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
