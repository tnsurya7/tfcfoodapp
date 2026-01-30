import emailjs from "@emailjs/browser";

export const sendOrderEmail = async (order) => {
  try {
    const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_ORDER_TEMPLATE_ID;
    const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.error("❌ EmailJS env variables missing");
      return;
    }

    // 🔑 INIT EMAILJS (MANDATORY)
    emailjs.init(PUBLIC_KEY);

    const templateParams = {
      message_html: `
      <div style="background:#0b0b0b;padding:20px;color:#fff;font-family:Arial">
        <div style="max-width:600px;margin:auto;background:#111;padding:20px;border-radius:10px">
          <h2 style="text-align:center;color:#ffd700">🍗 TFC Thozha Fried Chicken</h2>
          <p style="text-align:center;color:#ccc">New Order Received</p>
          
          <hr style="border:1px solid #333"/>
          
          <h3 style="color:#ff4444">Customer</h3>
          <p>Name: ${order.customer}</p>
          <p>Phone: ${order.phone}</p>
          <p>Email: ${order.email}</p>
          
          <h3 style="color:#ff4444">Order Type</h3>
          <p>${order.orderType === "pickup" ? "Store Pickup" : "Home Delivery"}</p>
          
          <h3 style="color:#ff4444">Items</h3>
          ${order.items.map(i =>
            `<p>${i.name} x ${i.quantity} - ₹${i.price * i.quantity}</p>`
          ).join("")}
          
          <h3>Total: ₹${order.total}</h3>
          <p>Payment Method: ${order.paymentMethod}</p>
          
          ${order.upiDetails ? `
            <p>UPI App: ${order.upiDetails.app}</p>
            <p>UPI Name: ${order.upiDetails.name}</p>
            <p>UPI Mobile: ${order.upiDetails.mobile}</p>
          ` : ""}
          
          <h3 style="color:#ff4444">Address</h3>
          <p>${order.address}</p>
          
          <hr style="border:1px solid #333"/>
          
          <p style="color:#aaa">
            TFC Thozha Fried Chicken<br/>
            Nasiyanur, Erode<br/>
            Phone: 8508436152
          </p>
        </div>
      </div>
      `
    };

    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams
    );

    console.log("✅ Email Sent:", result.text);
  } catch (error) {
    console.error("❌ EmailJS Error:", error);
  }
};