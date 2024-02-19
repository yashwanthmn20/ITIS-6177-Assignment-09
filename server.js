const express = require('express');
const app = express();
const port = 3000;
const mariadb = require("mariadb");
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'sample',
  port: 3306,
  connectionLimit: 5
});

app.use(express.json());

const swaggerOptions = {
  definition: {
    info: {
      title: 'API Swagger',
      description: 'Express MariaDB Swagger',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["server.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

/**
 * @swagger
 * /agents:
 *   get:
 *     summary: Get all agents
 *     responses:
 *       200:
 *         description: Successful response
 */

// GET all agents
app.get('/agents', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const rows = await connection.query("SELECT * FROM agents");
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /agents/{id}:
 *   get:
 *     summary: Get an agent by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Agent ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Agent not found
 */

// GET agent by ID
app.get('/agents/:id', async (req, res) => {
  const resourceId = req.params.id;

  try {
    const connection = await pool.getConnection();
    const rows = await connection.query("SELECT * FROM agents WHERE AGENT_CODE = ?;", [resourceId]);
    connection.release();

    if (rows.length === 0) {
      res.status(404).json({ error: "Resource not found" });
    } else {
      res.json(rows);
    }
  } catch (error) {
    console.error("Error fetching agent:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Agent not found
 */

app.get('/companies', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const rows = await connection.query("SELECT * FROM company");
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /agents:
 *   post:
 *     summary: Create a new agent
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             AGENT_CODE:
 *               type: string
 *             AGENT_NAME:
 *               type: string
 *             WORKING_AREA:
 *               type: string
 *             COMMISSION:
 *               type: number
 *             PHONE_NO:
 *               type: string
 *             COUNTRY:
 *               type: string
 *     responses:
 *       200:
 *         description: Agent created successfully
 *       400:
 *         description: Bad Request - Missing required fields
 *       500:
 *         description: Internal Server Error
 */

// POST endpoint to create a new agent
app.post('/agents', async (req, res) => {
  const newAgent = req.body;

  try {
    const connection = await pool.getConnection();
    const result = await connection.query("INSERT INTO agents (AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY) VALUES (?, ?, ?, ?, ?, ?)",
      [newAgent.AGENT_CODE, newAgent.AGENT_NAME, newAgent.WORKING_AREA, Number(newAgent.COMMISSION), newAgent.PHONE_NO, newAgent.COUNTRY]);
    connection.release();

    res.json({ message: "Agent created successfully", agentId: String(result.insertId) });
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({ error: error.sqlMessage +' '+ error.sql });
  }
});

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             COMPANY_ID:
 *               type: integer
 *             COMPANY_NAME:
 *               type: string
 *             COMPANY_CITY:
 *               type: string
 *     responses:
 *       200:
 *         description: Company created successfully
 *       400:
 *         description: Bad Request - Missing required fields
 *       500:
 *         description: Internal Server Error
 */

app.post('/companies', async (req, res) => {
  const newCompany = req.body;

  try {
    const connection = await pool.getConnection();
    const result = await connection.query("INSERT INTO company (COMPANY_ID, COMPANY_NAME, COMPANY_CITY) VALUES (?, ?, ?)",
      [Number(newCompany.COMPANY_ID), newCompany.COMPANY_NAME, newCompany.COMPANY_CITY]);
    connection.release();

    res.json({ message: "Company created successfully", companyId: String(result.insertId) });
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({ error: error.sqlMessage +' '+ error.sql });
  }
});


/**
 * @swagger
 * /agents/{id}:
 *   patch:
 *     summary: Update whole agent's details 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Agent ID
 *       - in: body
 *         name: body
 *         description: Fields to update for the customer
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             AGENT_NAME:
 *               type: string
 *             WORKING_AREA:
 *               type: string
 *             COMMISSION:
 *               type: number
 *             PHONE_NO:
 *               type: string
 *             COUNTRY:
 *               type: string
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Internal Server Error
 */

// PATCH endpoint to update a specific agent's details
app.patch('/agents/:id', async (req, res) => {
  const resourceId = req.params.id;
  const updatedDetails = req.body;

  try {
    const connection = await pool.getConnection();

    // Build the SET part of the SQL query
    const setClause = Object.keys(updatedDetails)
      .map((key) => `${key} = ?`)
      .join(', ');

    // Create the array of parameters
    const parameters = [...Object.values(updatedDetails), resourceId];

    const result = await connection.query(
      `UPDATE agents SET ${setClause} WHERE AGENT_CODE = ?`,
      parameters
    );
    connection.release();

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Resource not found' });
    } else {
      res.json({ message: 'Agent updated successfully' });
    }
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /agents/{id}:
 *   put:
 *     summary: Update a specific agent's details partially
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Agent ID
 *       - in: body
 *         name: body
 *         description: Fields to update for the customer
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             AGENT_NAME:
 *               type: string
 *             WORKING_AREA:
 *               type: string
 *             COMMISSION:
 *               type: number
 *             PHONE_NO:
 *               type: string
 *             COUNTRY:
 *               type: string
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *       400:
 *         description: Bad Request - Missing required fields
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Internal Server Error
 */

// PUT endpoint to replace a specific agent's details
app.put('/agents/:id', async (req, res) => {
  const resourceId = req.params.id;
  const updatedDetails = req.body;

  // Ensure required fields are present
  const { AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = updatedDetails;
  if (!AGENT_NAME || !WORKING_AREA || !COMMISSION || !PHONE_NO || !COUNTRY) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const connection = await pool.getConnection();

    const result = await connection.query(
      `UPDATE agents SET AGENT_NAME = ?, WORKING_AREA = ?, COMMISSION = ?, PHONE_NO = ?, COUNTRY = ? WHERE AGENT_CODE = ?`,
      [AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY, resourceId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Resource not found' });
    } else {
      res.json({ message: 'Agent updated successfully' });
    }
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /agents/{id}:
 *   delete:
 *     summary: Delete a specific agent by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Agent ID
 *         schema:
 *           type: object
 *     responses:
 *       200:
 *         description: Agent deleted successfully
 *       404:
 *         description: Agent not found
 */

// DELETE endpoint to remove a specific agent
app.delete('/agents/:id', async (req, res) => {
  const resourceId = req.params.id;

  try {
    const connection = await pool.getConnection();
    const result = await connection.query("DELETE FROM agents WHERE AGENT_CODE = ?", [resourceId]);
    connection.release();

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Resource not found" });
    } else {
      res.json({ message: "Agent deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
