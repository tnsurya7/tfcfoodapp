import emailjs from "@emailjs/browser";

export const sendOrderEmail = async (order) => {
  const SERVICE_ID = process.env.NEXT_PUBLIC_ORDER_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = process.env.NEXT_PUBLIC_ORDER_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = process.env.NEXT_PUBLIC_ORDER_EMAILJS_PUBLIC_KEY;

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error("❌ Missing EmailJS environment variables");
    return;
  }

  const htmlMessage = `
  <div style="font-family:Arial;background:#0b0b0b;padding:20px;color:#fff">
    <div style="max-width:600px;margin:auto;background:#111;border-radius:10px;padding:20px">
      <h2 style="text-align:center;color:#ffd700">🍗 TFC Thozha Fried Chicken</h2>
      <p style="text-align:center;color:#ccc">New Order Received</p>

      <h3 style="color:#ff4444">Customer</h3>
      <p>${order.customer}</p>
      <p>${order.phone}</p>
      <p>${order.email}</p>

      <h3 style="color:#ff4444">Items</h3>
      ${order.items
        .map(
          (i) =>
            `<p>${i.name} x ${i.quantity} - ₹${i.price * i.quantity}</p>`
        )
        .join("")}

      <h3>Total: ₹${order.total}</h3>
      <p>Payment: ${order.paymentMethod}</p>
      <p>Order Type: ${order.orderType}</p>

      <h3 style="color:#ff4444">Address</h3>
      <p>${order.address}</p>

      <p style="margin-top:20px;color:#aaa">
        TFC Thozha Fried Chicken<br/>
        Nasiyanur, Erode<br/>
        tfcfoodorder@gmail.com
      </p>
    </div>
  </div>
  `;

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        message_html: htmlMessage
      }
    );

    console.log("✅ Order email sent successfully");
  } catch (error) {
    console.error("❌ EmailJS Error:", error);
  }
};