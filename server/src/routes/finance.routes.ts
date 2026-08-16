import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  getDashboard,
  getExpenses,
  getSalary,
  getSalonProfit,
  getSalonRevenue,
  patchExpense,
  postExpense,
  removeExpense,
} from "../controllers/finance.controller";
import {
  createExpenseSchema,
  expenseIdParamSchema,
  expenseListQuerySchema,
  financePeriodQuerySchema,
  updateExpenseSchema,
} from "../validators/finance.validator";

export const financeRouter = Router();

financeRouter.use(authenticate, authorize("OWNER", "ADMIN", "SUPER_ADMIN"));

/**
 * @openapi
 * /api/finance/expenses:
 *   get:
 *     tags: [Finance]
 *     summary: List salon expenses
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/SalonIdQuery'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *           enum: [EQUIPMENT, CONSUMABLE, RENT, UTILITY, MARKETING, SALARY, OTHER]
 *       - name: from
 *         in: query
 *         schema: { type: string, format: date-time }
 *       - name: to
 *         in: query
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Paginated expenses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 *   post:
 *     tags: [Finance]
 *     summary: Create expense
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpenseCreate'
 *     responses:
 *       201:
 *         description: Expense created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
financeRouter.get("/expenses", validate(expenseListQuerySchema, "query"), getExpenses);
financeRouter.post("/expenses", validate(createExpenseSchema), postExpense);

/**
 * @openapi
 * /api/finance/expenses/{id}:
 *   patch:
 *     tags: [Finance]
 *     summary: Update expense
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpenseUpdate'
 *     responses:
 *       200:
 *         description: Expense updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   delete:
 *     tags: [Finance]
 *     summary: Delete expense
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Expense deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
financeRouter.patch(
  "/expenses/:id",
  validate(expenseIdParamSchema, "params"),
  validate(updateExpenseSchema),
  patchExpense,
);
financeRouter.delete("/expenses/:id", validate(expenseIdParamSchema, "params"), removeExpense);

/**
 * @openapi
 * /api/finance/dashboard:
 *   get:
 *     tags: [Finance]
 *     summary: Finance dashboard
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/SalonIdQuery'
 *       - $ref: '#/components/parameters/PeriodStartQuery'
 *       - $ref: '#/components/parameters/PeriodEndQuery'
 *     responses:
 *       200:
 *         description: Dashboard totals
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
financeRouter.get("/dashboard", validate(financePeriodQuerySchema, "query"), getDashboard);

/**
 * @openapi
 * /api/finance/revenue:
 *   get:
 *     tags: [Finance]
 *     summary: Salon revenue for period
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/SalonIdQuery'
 *       - $ref: '#/components/parameters/PeriodStartQuery'
 *       - $ref: '#/components/parameters/PeriodEndQuery'
 *     responses:
 *       200:
 *         description: Revenue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
financeRouter.get("/revenue", validate(financePeriodQuerySchema, "query"), getSalonRevenue);

/**
 * @openapi
 * /api/finance/profit:
 *   get:
 *     tags: [Finance]
 *     summary: Profit = Revenue - Salary - Expenses
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/SalonIdQuery'
 *       - $ref: '#/components/parameters/PeriodStartQuery'
 *       - $ref: '#/components/parameters/PeriodEndQuery'
 *     responses:
 *       200:
 *         description: Profit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
financeRouter.get("/profit", validate(financePeriodQuerySchema, "query"), getSalonProfit);

/**
 * @openapi
 * /api/finance/salary:
 *   get:
 *     tags: [Finance]
 *     summary: Calculate barber salaries for period
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/SalonIdQuery'
 *       - $ref: '#/components/parameters/PeriodStartQuery'
 *       - $ref: '#/components/parameters/PeriodEndQuery'
 *       - name: persist
 *         in: query
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Salary breakdown
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
financeRouter.get("/salary", validate(financePeriodQuerySchema, "query"), getSalary);
