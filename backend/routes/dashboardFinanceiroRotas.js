import express from "express";
import { getDashboardFinanceiro } from "../controllers/dashboardFinanceiroControllers.js";

const router = express.Router();

router.get("/", getDashboardFinanceiro);

export default router;
 