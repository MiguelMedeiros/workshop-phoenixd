const http = require("http");

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Server } from "socket.io";
import Phoenix from "phoenix-server-js";
import {
  createInvoice,
  getAllInvoices,
  getInvoiceByInvoice,
  updateInvoiceStatus,
} from "./_db";

const PORT = process.env.PORT || 3000;

type Props = {
  phoenix: Phoenix;
  db: any;
};

const initExpress = async ({ phoenix, db }: Props) => {
  try {
    const app = express();
    let connectedClients: any = {};

    const phoenixWs = phoenix.websocket();

    phoenixWs.on("connect", () => {
      console.log("Phoenix connected");
    });

    phoenixWs.on("close", () => {
      console.log("Phoenix disconnected");
    });

    phoenixWs.on("error", (error: any) => {
      console.error("Phoenix error:", error);
    });

    phoenixWs.on("message", async (message: any) => {
      const messageFromBuffer = Buffer.from(message, "base64").toString();
      const messageParsed = JSON.parse(messageFromBuffer);

      const incomingPayment = await phoenix.getIncomingPayment({
        paymentHash: messageParsed?.paymentHash,
      });

      if (!incomingPayment) {
        console.log("Incoming payment not found");
        return;
      }

      const updatedInvoice = await updateInvoiceStatus(
        incomingPayment?.invoice,
        "paid",
        db
      );

      if (!updatedInvoice) {
        console.log("Invoice not found");
        return;
      }

      const invoiceUpdated = await getInvoiceByInvoice(
        db,
        incomingPayment?.invoice
      );

      if (!invoiceUpdated) {
        console.log("Invoice not found");
        return;
      }

      emitEvent(
        connectedClients,
        messageParsed?.externalId,
        "paid",
        JSON.stringify(invoiceUpdated)
      );

      emitEventAll(
        connectedClients,
        "new-message",
        JSON.stringify(invoiceUpdated)
      );
    });

    app.use(cors());
    app.use(bodyParser.json());

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("a user connected", socket.id);
      connectedClients[socket.id] = socket;
      console.log(
        `Total users connected: ${Object.keys(connectedClients).length}`
      );

      emitEventAll(
        connectedClients,
        "users-connected",
        Object.keys(connectedClients).length
      );

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        delete connectedClients[socket.id];
        console.log(
          `Total users connected: ${Object.keys(connectedClients).length}`
        );

        emitEventAll(
          connectedClients,
          "users-connected",
          Object.keys(connectedClients).length
        );
      });
    });

    app.get("/", (req, res) => {
      res.json({ message: "Hello World!" });
    });

    app.get("/node-info", async (req, res) => {
      try {
        const info = await phoenix.getNodeInfo();

        return res.json({ info });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get("/balance", async (req, res) => {
      try {
        const balance = await phoenix.getBalance();

        return res.json({ balance });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get("/invoices", async (req, res) => {
      try {
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);

        const offset = (pageNumber - 1) * limitNumber;

        const invoices = await getAllInvoices(db, limitNumber, offset);

        return res.json({ invoices });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/new-invoice", async (req, res) => {
      try {
        const { author, message, amount, websocket_id } = req.body;

        if (!message || !author || !amount || !websocket_id) {
          return res.status(400).json({ error: "Missing parameters" });
        }

        const invoiceData = await phoenix.receiveLightningPayment({
          description: "new-invoice",
          amountSat: amount,
          externalId: websocket_id,
        });

        if (!invoiceData) {
          return res.status(500).json({ error: "Error creating invoice" });
        }

        await createInvoice({
          db,
          websocket_id,
          author,
          message,
          invoice_bolt11: invoiceData?.serialized,
          invoice: JSON.stringify(invoiceData),
          amount: amount,
        });

        return res.json({ invoiceData });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    return app;
  } catch (error: any) {
    console.log(error);
  }
};

const emitEventAll = (connectedClients: any, event: string, data: any) => {
  try {
    Object.keys(connectedClients).forEach((key) => {
      connectedClients[key].emit(event, data);
    });
  } catch (error) {
    console.log(error);
  }
};

const emitEvent = (
  connectedClients: any,
  websocket_id: string,
  event: string,
  data: any
) => {
  try {
    if (connectedClients[websocket_id]) {
      connectedClients[websocket_id].emit(event, data);
      console.log(`Message sent to ${websocket_id}: ${data}`);
    } else {
      console.log(`Socket ${websocket_id} not found`);
    }
  } catch (error) {
    console.log(error);
  }
};

export { initExpress };
